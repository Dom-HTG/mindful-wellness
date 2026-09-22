import type { Booking, BookingStatus } from "../types";
import { BOOKING_STATUSES, isBookingStatus } from "../types";
import type { ApiContext } from "../lib/context";
import { error, json, type ApiRequest, type ApiResponse } from "../lib/http";
import { parseBookingInput } from "../lib/validation";

export interface BookingStats {
  total: number;
  byStatus: Record<BookingStatus, number>;
}

function computeStats(bookings: Booking[]): BookingStats {
  const byStatus = Object.fromEntries(
    BOOKING_STATUSES.map((status) => [status, 0]),
  ) as Record<BookingStatus, number>;
  for (const booking of bookings) {
    byStatus[booking.status] = (byStatus[booking.status] ?? 0) + 1;
  }
  return { total: bookings.length, byStatus };
}

export async function createBooking(
  req: ApiRequest,
  ctx: ApiContext,
): Promise<ApiResponse> {
  const parsed = parseBookingInput(req.body);
  if (!parsed.ok || !parsed.value) {
    return json(400, {
      error: "Invalid booking payload.",
      details: parsed.errors,
    });
  }
  const booking = await ctx.store.create(parsed.value);
  return json(201, { booking });
}

export async function listBookings(
  req: ApiRequest,
  ctx: ApiContext,
): Promise<ApiResponse> {
  let bookings = await ctx.store.list();

  const statusFilter = req.query.status;
  if (statusFilter && isBookingStatus(statusFilter)) {
    bookings = bookings.filter((b) => b.status === statusFilter);
  }

  const search = req.query.q?.trim().toLowerCase();
  if (search) {
    bookings = bookings.filter((b) =>
      [b.name, b.email, b.phone, b.service, b.notes, b.symptoms]
        .join(" ")
        .toLowerCase()
        .includes(search),
    );
  }

  return json(200, { bookings, stats: computeStats(bookings) });
}

export async function getBooking(
  id: string,
  ctx: ApiContext,
): Promise<ApiResponse> {
  const booking = await ctx.store.get(id);
  if (!booking) return error(404, "Booking not found.");
  return json(200, { booking });
}

export async function updateBooking(
  id: string,
  req: ApiRequest,
  actor: string,
  ctx: ApiContext,
): Promise<ApiResponse> {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const update: { status?: BookingStatus; adminNotes?: string } = {};

  if (body.status !== undefined) {
    if (!isBookingStatus(body.status)) {
      return json(400, { error: "Invalid booking status." });
    }
    update.status = body.status;
  }

  if (body.adminNotes !== undefined) {
    if (typeof body.adminNotes !== "string") {
      return json(400, { error: "`adminNotes` must be a string." });
    }
    update.adminNotes = body.adminNotes;
  }

  if (update.status === undefined && update.adminNotes === undefined) {
    return json(400, { error: "No supported fields to update." });
  }

  const booking = await ctx.store.update(id, update, actor);
  if (!booking) return error(404, "Booking not found.");
  return json(200, { booking });
}
