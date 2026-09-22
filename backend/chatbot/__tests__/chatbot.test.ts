// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import type { ApiContext } from "../../admin/lib/context";
import type { Booking, BookingInput, BookingUpdate } from "../../admin/types";
import { handleChat } from "../index";
import { checkAvailability, createChatBooking } from "../tools";
import type { BookingStore } from "../../admin/lib/store";
import { newBookingId, toBooking } from "../../admin/lib/store";

function memoryStore(seed: Booking[] = []): BookingStore {
  const bookings: Booking[] = [...seed];
  return {
    async list() {
      return [...bookings];
    },
    async get(id) {
      return bookings.find((b) => b.id === id) ?? null;
    },
    async create(input: BookingInput) {
      const booking = toBooking(newBookingId(), input);
      bookings.push(booking);
      return booking;
    },
    async update(id: string, update: BookingUpdate, actor: string) {
      const index = bookings.findIndex((b) => b.id === id);
      if (index === -1) return null;
      const next = { ...bookings[index], ...update, updatedAt: new Date().toISOString() };
      void actor;
      bookings[index] = next;
      return next;
    },
  };
}

function context(overrides: Partial<ApiContext> = {}): ApiContext {
  return {
    env: { SLOT_CAPACITY: "1" },
    store: memoryStore(),
    verifyToken: async () => null,
    ...overrides,
  };
}

function sseStream(chunks: unknown[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`),
        );
      }
      controller.close();
    },
  });
}

async function readStream(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let output = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    output += decoder.decode(value);
  }
  return output;
}

describe("checkAvailability", () => {
  it("marks slots as available based on capacity", async () => {
    const store = memoryStore([
      toBooking(newBookingId(), {
        name: "A",
        email: "a@example.com",
        service: "Psychiatry",
        date: "2030-05-01",
        timeSlot: "Morning",
      }),
    ]);
    const result = await checkAvailability("2030-05-01", context({ store }));
    expect(result.ok).toBe(true);
    expect(result.availableSlots).toEqual(["Afternoon", "Evening"]);
  });

  it("rejects dates in the past", async () => {
    const result = await checkAvailability("2000-01-01", context());
    expect(result.ok).toBe(false);
  });
});

describe("createChatBooking", () => {
  it("validates required fields", async () => {
    const result = await createChatBooking(
      { name: "Jane", email: "not-an-email", service: "" },
      context(),
    );
    expect(result.ok).toBe(false);
    expect(result.errors?.length).toBeGreaterThan(0);
  });

  it("creates a chatbot booking and returns a summary", async () => {
    const store = memoryStore();
    const result = await createChatBooking(
      {
        name: "Jane Doe",
        email: "jane@example.com",
        service: "Psychiatry",
        date: "2030-05-01",
        timeSlot: "Morning",
      },
      context({ store }),
    );
    expect(result.ok).toBe(true);
    expect(result.booking?.service).toBe("Psychiatry");
    const saved = await store.list();
    expect(saved).toHaveLength(1);
    expect(saved[0].source).toBe("chatbot");
  });

  it("refuses to book a full slot", async () => {
    const store = memoryStore([
      toBooking(newBookingId(), {
        name: "A",
        email: "a@example.com",
        service: "Psychiatry",
        date: "2030-05-01",
        timeSlot: "Morning",
      }),
    ]);
    const result = await createChatBooking(
      {
        name: "Jane",
        email: "jane@example.com",
        service: "Psychiatry",
        date: "2030-05-01",
        timeSlot: "Morning",
      },
      context({ store }),
    );
    expect(result.ok).toBe(false);
    expect(result.availableSlots).toEqual(["Afternoon", "Evening"]);
  });

  it("normalizes legacy service names to Psychiatry", async () => {
    const store = memoryStore();
    const result = await createChatBooking(
      {
        name: "Jane Doe",
        email: "jane@example.com",
        service: "Psychological Counseling",
        date: "2030-05-01",
        timeSlot: "Afternoon",
      },
      context({ store }),
    );
    expect(result.ok).toBe(true);
    expect((await store.list())[0].service).toBe("Psychiatry");
  });

  it("accepts human-friendly dates", async () => {
    const result = await checkAvailability("May 1, 2030", context());
    expect(result.ok).toBe(true);
    expect(result.date).toBe("2030-05-01");
  });

  it("rejects details the patient never actually provided", async () => {
    const store = memoryStore();
    const result = await createChatBooking(
      {
        name: "Patient Name",
        email: "made.up@example.com",
        service: "Psychiatry",
        date: "2030-05-01",
        timeSlot: "Morning",
      },
      context({ store }),
      { userText: "Hi, I'd like to book something." },
    );
    expect(result.ok).toBe(false);
    expect(await store.list()).toHaveLength(0);
  });

  it("accepts details grounded in the conversation", async () => {
    const store = memoryStore();
    const result = await createChatBooking(
      {
        name: "Jane Doe",
        email: "jane@example.com",
        service: "Psychiatry",
        date: "2030-05-01",
        timeSlot: "Morning",
      },
      context({ store }),
      {
        userText:
          "I'm Jane Doe, my email is jane@example.com, May 1 works, morning is fine",
      },
    );
    expect(result.ok).toBe(true);
  });

  it("rejects a booking when the patient never named a day or time", async () => {
    const store = memoryStore();
    const result = await createChatBooking(
      {
        name: "Jane",
        email: "jane@example.com",
        service: "Psychiatry",
        date: "2030-05-01",
        timeSlot: "Morning",
      },
      context({ store }),
      { userText: "I'm Jane, my email is jane@example.com" },
    );
    expect(result.ok).toBe(false);
    expect(await store.list()).toHaveLength(0);
  });

  it("refuses a second booking when one already exists", async () => {
    const store = memoryStore();
    const result = await createChatBooking(
      {
        name: "Jane",
        email: "jane@example.com",
        service: "Psychiatry",
        date: "2030-05-02",
        timeSlot: "Morning",
      },
      context({ store }),
      { userText: "Jane jane@example.com", bookingLocked: true },
    );
    expect(result.ok).toBe(false);
  });
});

describe("handleChat", () => {
  it("runs tools then streams the final answer with a booking event", async () => {
    const store = memoryStore();
    const responses: unknown[] = [
      { tool_calls: [{ name: "check_availability", arguments: { date: "2030-05-01" } }] },
      {
        tool_calls: [
          {
            name: "create_booking",
            arguments: {
              name: "Jane Doe",
              email: "jane@example.com",
              service: "Psychiatry",
              date: "2030-05-01",
              timeSlot: "Morning",
            },
          },
        ],
      },
      { response: "" },
    ];
    let index = 0;
    const run = vi.fn(async (_model: string, input: Record<string, unknown>) => {
      if (input.stream) {
        return sseStream([{ response: "You're booked in!" }, { response: "" }]);
      }
      return responses[index++] ?? { response: "" };
    });

    const response = await handleChat(
      {
        method: "POST",
        path: "/chat",
        query: {},
        headers: {},
        body: {
          messages: [
            {
              role: "user",
              content:
                "Please book Jane Doe at jane@example.com for Psychiatry on 2030-05-01 in the Morning.",
            },
          ],
        },
      },
      context({ store, ai: { run } }),
    );

    expect(response.status).toBe(200);
    const text = await readStream(response.stream!);
    expect(text).toContain('"type":"booking"');
    expect(text).toContain("You're booked in!");
    expect(text).toContain('"type":"done"');
    expect((await store.list())[0].source).toBe("chatbot");
  });

  it("injects a session note when a booking is already confirmed", async () => {
    const store = memoryStore();
    let captured: { role: string; content: string }[] = [];
    const run = vi.fn(async (_model: string, input: Record<string, unknown>) => {
      if (input.stream) return sseStream([{ response: "Anytime!" }]);
      captured = input.messages as { role: string; content: string }[];
      return { response: "" };
    });

    const response = await handleChat(
      {
        method: "POST",
        path: "/chat",
        query: {},
        headers: {},
        body: {
          messages: [{ role: "user", content: "thanks!" }],
          booking: {
            id: "b-1",
            service: "Psychiatry",
            date: "2030-05-01",
            timeSlot: "Morning",
          },
        },
      },
      context({ store, ai: { run } }),
    );

    expect(response.status).toBe(200);
    expect(captured[0].role).toBe("system");
    expect(captured[0].content).toContain("already has a confirmed booking");
    await readStream(response.stream!);
  });

  it("does not create a second booking when one is already confirmed", async () => {
    const store = memoryStore();
    const responses: unknown[] = [
      {
        tool_calls: [
          {
            name: "create_booking",
            arguments: {
              name: "Jane",
              email: "jane@example.com",
              service: "Psychiatry",
              date: "2030-05-02",
              timeSlot: "Morning",
            },
          },
        ],
      },
      { response: "" },
    ];
    let index = 0;
    const run = vi.fn(async (_model: string, input: Record<string, unknown>) => {
      if (input.stream) return sseStream([{ response: "You're all set!" }]);
      return responses[index++] ?? { response: "" };
    });

    const response = await handleChat(
      {
        method: "POST",
        path: "/chat",
        query: {},
        headers: {},
        body: {
          messages: [{ role: "user", content: "thanks! jane@example.com" }],
          booking: {
            id: "b-1",
            service: "Psychiatry",
            date: "2030-05-01",
            timeSlot: "Morning",
          },
        },
      },
      context({ store, ai: { run } }),
    );

    const text = await readStream(response.stream!);
    expect(text).not.toContain('"type":"booking"');
    expect(await store.list()).toHaveLength(0);
  });

  it("returns 503 when the AI binding is missing", async () => {
    const response = await handleChat(
      { method: "POST", path: "/chat", query: {}, headers: {}, body: { messages: [{ role: "user", content: "hi" }] } },
      context(),
    );
    expect(response.status).toBe(503);
  });

  it("rejects an empty payload", async () => {
    const response = await handleChat(
      { method: "POST", path: "/chat", query: {}, headers: {}, body: {} },
      context({ ai: { run: vi.fn() } }),
    );
    expect(response.status).toBe(400);
  });
});
