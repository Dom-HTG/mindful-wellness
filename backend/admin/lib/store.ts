import type {
  Booking,
  BookingInput,
  BookingStatus,
  BookingUpdate,
} from "../types";

export interface BookingStore {
  list(): Promise<Booking[]>;
  get(id: string): Promise<Booking | null>;
  create(input: BookingInput): Promise<Booking>;
  update(
    id: string,
    update: BookingUpdate,
    actor: string,
  ): Promise<Booking | null>;
}

export function newBookingId(): string {
  return globalThis.crypto.randomUUID();
}

export function toBooking(id: string, input: BookingInput): Booking {
  const now = new Date().toISOString();
  return {
    id,
    createdAt: now,
    updatedAt: now,
    status: "pending",
    source: input.source ?? "website",
    name: input.name,
    email: input.email,
    phone: input.phone ?? "",
    service: input.service,
    date: input.date ?? "",
    timeSlot: input.timeSlot ?? "",
    notes: input.notes ?? "",
    concerns: input.concerns ?? [],
    conditions: input.conditions ?? [],
    duration: input.duration ?? "",
    symptoms: input.symptoms ?? "",
    adminNotes: "",
    statusHistory: [
      { status: "pending", at: now, by: input.source ?? "website" },
    ],
  };
}

export function normalizeBooking(
  id: string,
  data: Partial<Booking>,
): Booking {
  return {
    id,
    createdAt: data.createdAt ?? new Date(0).toISOString(),
    updatedAt: data.updatedAt ?? data.createdAt ?? new Date(0).toISOString(),
    status: data.status ?? "pending",
    source: data.source ?? "website",
    name: data.name ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    service: data.service ?? "",
    date: data.date ?? "",
    timeSlot: data.timeSlot ?? "",
    notes: data.notes ?? "",
    concerns: Array.isArray(data.concerns) ? data.concerns : [],
    conditions: Array.isArray(data.conditions) ? data.conditions : [],
    duration: data.duration ?? "",
    symptoms: data.symptoms ?? "",
    adminNotes: data.adminNotes ?? "",
    statusHistory: Array.isArray(data.statusHistory) ? data.statusHistory : [],
  };
}

export function applyUpdate(
  current: Booking,
  update: BookingUpdate,
  actor: string,
): Booking {
  const now = new Date().toISOString();
  const next: Booking = { ...current, updatedAt: now };
  if (update.adminNotes !== undefined) {
    next.adminNotes = update.adminNotes;
  }
  if (update.status && update.status !== current.status) {
    next.status = update.status;
    next.statusHistory = [
      ...current.statusHistory,
      { status: update.status, at: now, by: actor },
    ];
  }
  return next;
}

export type { BookingStatus };
