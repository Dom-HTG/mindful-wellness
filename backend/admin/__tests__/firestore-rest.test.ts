// @vitest-environment node
import { generateKeyPairSync } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  decodeFields,
  encodeFields,
  FirestoreRestStore,
} from "../lib/firestore-rest";
import type { Booking } from "../types";

const { privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" },
});

const env = {
  FIREBASE_PROJECT_ID: "test-project",
  FIREBASE_CLIENT_EMAIL: "svc@test-project.iam.gserviceaccount.com",
  FIREBASE_PRIVATE_KEY: privateKey,
  BOOKINGS_COLLECTION: "bookings",
};

function makeBooking(): Booking {
  return {
    id: "b-1",
    createdAt: "2026-04-01T10:00:00.000Z",
    updatedAt: "2026-04-01T10:00:00.000Z",
    status: "pending",
    source: "website",
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "555-0100",
    service: "Psychiatry",
    date: "2026-05-01",
    timeSlot: "Morning",
    notes: "First visit",
    concerns: ["Low Energy", "Weight Plateaus"],
    conditions: ["None"],
    duration: "< 6 Months",
    symptoms: "Fatigue",
    adminNotes: "",
    statusHistory: [
      { status: "pending", at: "2026-04-01T10:00:00.000Z", by: "website" },
    ],
  };
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Firestore value codec", () => {
  it("round-trips a booking document", () => {
    const booking = makeBooking();
    const decoded = decodeFields(encodeFields(booking)) as unknown as Booking;
    expect(decoded).toEqual(booking);
  });

  it("encodes nested arrays and objects with the right Firestore types", () => {
    const fields = encodeFields({ name: "Jane", tags: ["a", "b"] });
    expect(fields.name).toEqual({ stringValue: "Jane" });
    expect(fields.tags).toEqual({
      arrayValue: { values: [{ stringValue: "a" }, { stringValue: "b" }] },
    });
  });
});

describe("FirestoreRestStore", () => {
  let stored: { id: string; fields: Record<string, unknown> } | null = null;

  beforeEach(() => {
    stored = null;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
        const url = String(input);
        const method = (init?.method ?? "GET").toUpperCase();

        if (url.includes("oauth2.googleapis.com/token")) {
          return jsonResponse({ access_token: "token", expires_in: 3600 });
        }

        if (method === "POST" && url.includes("documentId=")) {
          const id = new URL(url).searchParams.get("documentId") ?? "";
          const body = JSON.parse(String(init?.body)) as {
            fields: Record<string, unknown>;
          };
          stored = { id, fields: body.fields };
          return jsonResponse({
            name: `projects/test-project/databases/(default)/documents/bookings/${id}`,
            fields: body.fields,
          });
        }

        if (method === "GET" && /\/documents\/bookings\/[^/?]+$/.test(url)) {
          const id = url.split("/").pop() ?? "";
          if (stored && stored.id === id) {
            return jsonResponse({
              name: `projects/test-project/databases/(default)/documents/bookings/${id}`,
              fields: stored.fields,
            });
          }
          return jsonResponse({ error: { message: "not found" } }, 404);
        }

        if (method === "GET" && url.includes("/documents/bookings")) {
          return jsonResponse({
            documents: stored
              ? [
                  {
                    name: `projects/test-project/databases/(default)/documents/bookings/${stored.id}`,
                    fields: stored.fields,
                  },
                ]
              : [],
          });
        }

        if (method === "PATCH") {
          const id = url.split("/").pop() ?? "";
          const body = JSON.parse(String(init?.body)) as {
            fields: Record<string, unknown>;
          };
          stored = { id, fields: body.fields };
          return jsonResponse({
            name: `projects/test-project/databases/(default)/documents/bookings/${id}`,
            fields: body.fields,
          });
        }

        return jsonResponse({ error: { message: "unexpected" } }, 400);
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates, reads, lists and updates bookings", async () => {
    const store = new FirestoreRestStore(env);

    const created = await store.create({
      name: "Jane Doe",
      email: "jane@example.com",
      service: "Psychiatry",
    });
    expect(created.status).toBe("pending");

    const fetched = await store.get(created.id);
    expect(fetched?.email).toBe("jane@example.com");
    expect(fetched?.concerns).toEqual([]);

    const listed = await store.list();
    expect(listed).toHaveLength(1);

    const updated = await store.update(
      created.id,
      { status: "completed", adminNotes: "Seen in clinic" },
      "admin@mindfulwellness.io",
    );
    expect(updated?.status).toBe("completed");
    expect(updated?.adminNotes).toBe("Seen in clinic");
    expect(updated?.statusHistory.map((event) => event.status)).toEqual([
      "pending",
      "completed",
    ]);
  });

  it("returns null for a missing booking", async () => {
    const store = new FirestoreRestStore(env);
    expect(await store.get("does-not-exist")).toBeNull();
  });
});
