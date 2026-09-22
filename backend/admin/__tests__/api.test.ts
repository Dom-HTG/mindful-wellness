import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { routeApiRequest as route } from "../index";
import { createNodeContext } from "../lib/context-node";
import type { ApiRequest } from "../lib/http";

const tempDirs: string[] = [];

function freshDataDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "mw-admin-test-"));
  tempDirs.push(dir);
  process.env.ADMIN_DATA_DIR = dir;
  return dir;
}

function request(overrides: Partial<ApiRequest> = {}): ApiRequest {
  return {
    method: "GET",
    path: "/",
    query: {},
    headers: {},
    body: undefined,
    ...overrides,
  };
}

function routeApiRequest(req: ApiRequest) {
  return route(req, createNodeContext());
}

function auth(email = "admin@mindfulwellness.io"): Record<string, string> {
  return { authorization: `Bearer dev:${email}` };
}

const validBooking = {
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "555-0100",
  service: "Psychiatry",
  date: "2026-05-01",
  timeSlot: "Morning",
  concerns: ["Low Energy & Fatigue"],
  conditions: ["None"],
  duration: "< 6 Months",
  symptoms: "Fatigue",
  notes: "First visit",
};

beforeEach(() => {
  freshDataDir();
  process.env.ADMIN_DEV_MODE = "true";
  delete process.env.ADMIN_EMAILS;
});

afterAll(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("admin API", () => {
  it("reports health", async () => {
    const res = await routeApiRequest(request({ path: "/health" }));
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true });
  });

  it("rejects unauthenticated access to bookings", async () => {
    const res = await routeApiRequest(
      request({ path: "/admin/bookings" }),
    );
    expect(res.status).toBe(401);
  });

  it("creates a booking and lists it with stats", async () => {
    const created = await routeApiRequest(
      request({ method: "POST", path: "/bookings", body: validBooking }),
    );
    expect(created.status).toBe(201);
    const booking = (created.body as { booking: { id: string; status: string } })
      .booking;
    expect(booking.status).toBe("pending");

    const list = await routeApiRequest(
      request({ path: "/admin/bookings", headers: auth() }),
    );
    expect(list.status).toBe(200);
    const data = list.body as {
      bookings: unknown[];
      stats: { total: number; byStatus: Record<string, number> };
    };
    expect(data.bookings).toHaveLength(1);
    expect(data.stats.total).toBe(1);
    expect(data.stats.byStatus.pending).toBe(1);
  });

  it("rejects invalid booking payloads", async () => {
    const res = await routeApiRequest(
      request({
        method: "POST",
        path: "/bookings",
        body: { name: "", email: "nope" },
      }),
    );
    expect(res.status).toBe(400);
  });

  it("updates a booking status and records history", async () => {
    const created = await routeApiRequest(
      request({ method: "POST", path: "/bookings", body: validBooking }),
    );
    const id = (created.body as { booking: { id: string } }).booking.id;

    const updated = await routeApiRequest(
      request({
        method: "PATCH",
        path: `/admin/bookings/${id}`,
        headers: auth(),
        body: { status: "completed", adminNotes: "Seen in clinic" },
      }),
    );
    expect(updated.status).toBe(200);
    const booking = (
      updated.body as {
        booking: {
          status: string;
          adminNotes: string;
          statusHistory: { status: string; by: string }[];
        };
      }
    ).booking;
    expect(booking.status).toBe("completed");
    expect(booking.adminNotes).toBe("Seen in clinic");
    expect(booking.statusHistory.map((h) => h.status)).toEqual([
      "pending",
      "completed",
    ]);
    expect(booking.statusHistory[1].by).toBe("admin@mindfulwellness.io");
  });

  it("rejects an invalid status transition", async () => {
    const created = await routeApiRequest(
      request({ method: "POST", path: "/bookings", body: validBooking }),
    );
    const id = (created.body as { booking: { id: string } }).booking.id;
    const res = await routeApiRequest(
      request({
        method: "PATCH",
        path: `/admin/bookings/${id}`,
        headers: auth(),
        body: { status: "archived" },
      }),
    );
    expect(res.status).toBe(400);
  });

  it("blocks emails outside the allowlist", async () => {
    process.env.ADMIN_EMAILS = "boss@clinic.com";
    const res = await routeApiRequest(
      request({
        path: "/admin/bookings",
        headers: auth("intruder@example.com"),
      }),
    );
    expect(res.status).toBe(403);
  });

  it("returns 404 for unknown routes", async () => {
    const res = await routeApiRequest(request({ path: "/nope" }));
    expect(res.status).toBe(404);
  });
});
