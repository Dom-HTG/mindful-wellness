import type { Booking, BookingInput } from "../../backend/admin/types";
import { apiRequest } from "./apiClient";

export interface BookingResponse {
  booking: Booking;
}

export function createBooking(input: BookingInput): Promise<BookingResponse> {
  return apiRequest<BookingResponse>("/bookings", {
    method: "POST",
    body: input,
  });
}
