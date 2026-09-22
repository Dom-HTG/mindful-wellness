export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export type BookingSource = "website" | "chatbot" | "admin";

export interface BookingStatusEvent {
  status: BookingStatus;
  at: string;
  by: string;
}

export interface Booking {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: BookingStatus;
  source: BookingSource;
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  timeSlot: string;
  notes: string;
  concerns: string[];
  conditions: string[];
  duration: string;
  symptoms: string;
  adminNotes: string;
  statusHistory: BookingStatusEvent[];
}

export interface AdminUser {
  uid: string;
  email: string;
  name: string;
  picture: string;
}

export interface BookingInput {
  name: string;
  email: string;
  phone?: string;
  service: string;
  date?: string;
  timeSlot?: string;
  notes?: string;
  concerns?: string[];
  conditions?: string[];
  duration?: string;
  symptoms?: string;
  source?: BookingSource;
}

export interface BookingUpdate {
  status?: BookingStatus;
  adminNotes?: string;
}

export function isBookingStatus(value: unknown): value is BookingStatus {
  return (
    typeof value === "string" &&
    (BOOKING_STATUSES as readonly string[]).includes(value)
  );
}
