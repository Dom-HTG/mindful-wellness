import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { Booking } from "../../../backend/admin/types";
import { AdminPage } from "../../pages/AdminPage";

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: "b-1",
    createdAt: new Date("2026-04-01T10:00:00Z").toISOString(),
    updatedAt: new Date("2026-04-01T10:00:00Z").toISOString(),
    status: "pending",
    source: "website",
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "555-0100",
    service: "Psychiatry",
    date: "2026-05-01",
    timeSlot: "Morning",
    notes: "",
    concerns: ["Low Energy"],
    conditions: ["None"],
    duration: "< 6 Months",
    symptoms: "",
    adminNotes: "",
    statusHistory: [{ status: "pending", at: "2026-04-01T10:00:00Z", by: "website" }],
    ...overrides,
  };
}

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(data),
  } as Response;
}

describe("AdminPage", () => {
  let bookings: Booking[];

  beforeEach(() => {
    window.localStorage.clear();
    bookings = [makeBooking()];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === "string" ? input : input.toString();
        const method = (init?.method ?? "GET").toUpperCase();

        if (url.includes("/api/admin/me")) {
          return jsonResponse({
            user: {
              uid: "dev-admin",
              email: "support@mindfulwellness.io",
              name: "Admin",
              picture: "",
            },
          });
        }

        if (url.includes("/api/admin/bookings")) {
          const match = /\/admin\/bookings\/([^/?]+)/.exec(url);
          if (match && method === "PATCH") {
            const id = match[1];
            const body = JSON.parse(String(init?.body ?? "{}")) as Partial<Booking>;
            bookings = bookings.map((booking) =>
              booking.id === id ? { ...booking, ...body } : booking,
            );
            return jsonResponse({ booking: bookings.find((b) => b.id === id) });
          }
          return jsonResponse({
            bookings,
            stats: {
              total: bookings.length,
              byStatus: {
                pending: bookings.filter((b) => b.status === "pending").length,
                confirmed: 0,
                completed: bookings.filter((b) => b.status === "completed").length,
                cancelled: 0,
              },
            },
          });
        }

        return jsonResponse({ error: "not found" }, 404);
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("signs in via dev mode and manages a booking end to end", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Continue in dev mode")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Continue in dev mode" }));

    expect(await screen.findByText("Bookings Console")).toBeInTheDocument();
    expect(await screen.findByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Psychiatry")).toBeInTheDocument();

    await user.click(screen.getByText("Jane Doe"));

    expect(await screen.findByText("Manage booking")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Mark Completed/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Booking marked as completed/i),
      ).toBeInTheDocument();
    });
  });
});
