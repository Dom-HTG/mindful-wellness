import type {
  AdminUser,
  Booking,
  BookingStatus,
} from "../../../backend/admin/types";
import { apiRequest } from "../../lib/apiClient";

export interface BookingStats {
  total: number;
  byStatus: Record<BookingStatus, number>;
}

export interface BookingsResponse {
  bookings: Booking[];
  stats: BookingStats;
}

export interface BookingResponse {
  booking: Booking;
}

export function fetchMe(token: string | null): Promise<{ user: AdminUser }> {
  return apiRequest<{ user: AdminUser }>("/admin/me", { token });
}

export function fetchBookings(
  token: string | null,
  params: { status?: BookingStatus | "all"; q?: string } = {},
): Promise<BookingsResponse> {
  return apiRequest<BookingsResponse>("/admin/bookings", {
    token,
    query: {
      status: params.status && params.status !== "all" ? params.status : undefined,
      q: params.q,
    },
  });
}

export function updateBooking(
  token: string | null,
  id: string,
  patch: { status?: BookingStatus; adminNotes?: string },
): Promise<BookingResponse> {
  return apiRequest<BookingResponse>(`/admin/bookings/${encodeURIComponent(id)}`, {
    method: "PATCH",
    token,
    body: patch,
  });
}
