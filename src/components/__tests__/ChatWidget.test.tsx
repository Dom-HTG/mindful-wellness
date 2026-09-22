import { afterEach, describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/utils";
import { ChatWidget } from "../chatbot/ChatWidget";

function sseResponse(events: unknown[]): Response {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      for (const event of events) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }
      controller.close();
    },
  });
  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "text/event-stream" },
  });
}

describe("ChatWidget", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens and shows the assistant panel", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChatWidget />);

    await user.click(screen.getByRole("button", { name: /open chat/i }));
    expect(screen.getByText("Wellness Assistant")).toBeInTheDocument();
    expect(screen.getByText(/online/i)).toBeInTheDocument();
  });

  it("streams the assistant reply from the chat API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        sseResponse([
          { type: "token", value: "Thanks for " },
          { type: "token", value: "reaching out!" },
          { type: "done" },
        ]),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<ChatWidget />);

    await user.click(screen.getByRole("button", { name: /open chat/i }));
    await user.type(screen.getByLabelText("Chat message"), "Hello there");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(screen.getByText("Hello there")).toBeInTheDocument();
    expect(
      await screen.findByText("Thanks for reaching out!"),
    ).toBeInTheDocument();
  });

  it("shows a booking confirmation card when a booking event arrives", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        sseResponse([
          { type: "token", value: "You're all set." },
          {
            type: "booking",
            booking: {
              id: "b-12345678",
              name: "Jane Doe",
              service: "Psychiatry",
              date: "2026-05-01",
              timeSlot: "Morning",
            },
          },
          { type: "done" },
        ]),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<ChatWidget />);

    await user.click(screen.getByRole("button", { name: /open chat/i }));
    await user.type(screen.getByLabelText("Chat message"), "Book me in");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText("Consultation requested")).toBeInTheDocument();
    expect(screen.getByText(/Psychiatry · 2026-05-01 · Morning/)).toBeInTheDocument();
  });
});
