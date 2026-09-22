import type { ApiContext } from "../admin/lib/context";
import { parseBookingInput } from "../admin/lib/validation";
import type { Booking } from "../admin/types";
import { BOOKING_TIME_SLOTS, type BookingTimeSlot } from "./knowledge";

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export const TOOLS: ToolDefinition[] = [
  {
    name: "check_availability",
    description:
      "Check which consultation time windows are still open on a given date. Always call this before offering a slot.",
    parameters: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description: "The requested date in YYYY-MM-DD format.",
        },
        timeSlot: {
          type: "string",
          enum: [...BOOKING_TIME_SLOTS],
          description: "Optional preferred time window.",
        },
      },
      required: ["date"],
    },
  },
  {
    name: "create_booking",
    description:
      "Create a consultation booking for the patient. Only call after the patient has confirmed all details.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Patient's full name." },
        email: { type: "string", description: "Patient's email address." },
        phone: { type: "string", description: "Optional phone number." },
        service: {
          type: "string",
          description:
            "Requested service: Psychiatry, Nutritional Counseling, or General Consultation.",
        },
        date: {
          type: "string",
          description: "Requested date in YYYY-MM-DD format.",
        },
        timeSlot: {
          type: "string",
          enum: [...BOOKING_TIME_SLOTS],
          description: "Preferred time window.",
        },
        notes: { type: "string", description: "Optional scheduling notes." },
        concerns: {
          type: "array",
          items: { type: "string" },
          description: "Optional list of primary health concerns.",
        },
        conditions: {
          type: "array",
          items: { type: "string" },
          description: "Optional list of diagnosed medical conditions.",
        },
        duration: {
          type: "string",
          description: "Optional how long they have experienced symptoms.",
        },
        symptoms: {
          type: "string",
          description: "Optional current medications or specific symptoms.",
        },
      },
      required: ["name", "email", "service", "date", "timeSlot"],
    },
  },
];

export interface AvailabilityResult {
  ok: boolean;
  date?: string;
  capacity?: number;
  slots?: {
    slot: BookingTimeSlot;
    booked: number;
    available: boolean;
  }[];
  availableSlots?: BookingTimeSlot[];
  error?: string;
}

export interface CreateBookingResult {
  ok: boolean;
  booking?: {
    id: string;
    name: string;
    service: string;
    date: string;
    timeSlot: string;
  };
  errors?: string[];
  availableSlots?: BookingTimeSlot[];
}

function asString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

function asStringArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    return value.map((item) => asString(item)).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[;,\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return undefined;
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

const SERVICE_ALIASES: Record<string, string> = {
  psychiatry: "Psychiatry",
  "psychiatric counseling": "Psychiatry",
  "psychological counseling": "Psychiatry",
  "psychiatry & behavioral": "Psychiatry",
  "nutritional counseling": "Nutritional Counseling",
  "nutrition counseling": "Nutritional Counseling",
  "nutrition": "Nutritional Counseling",
  "general consultation": "General Consultation",
  consultation: "General Consultation",
};

function normalizeService(value: string): string {
  const trimmed = value.trim();
  return SERVICE_ALIASES[trimmed.toLowerCase()] ?? trimmed;
}

function normalizeDate(value: string): string {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return trimmed;
}

const TIME_SLOT_ALIASES: Record<string, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

function normalizeTimeSlot(value: string): string {
  return TIME_SLOT_ALIASES[value.trim().toLowerCase()] ?? value.trim();
}

const DATE_SIGNAL =
  /\b(\d{4}|\d{1,2}[/-]\d{1,2}|today|tomorrow|tonight|next|week|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december|any|anytime|flexible|whenever)\b/i;

const TIME_SIGNAL =
  /\b(morning|afternoon|evening|noon|am|pm|early|late|any|anytime|flexible|whatever)\b/i;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getSlotCapacity(env: Record<string, string | undefined>): number {
  const raw = Number.parseInt(env.SLOT_CAPACITY ?? "", 10);
  if (Number.isFinite(raw) && raw > 0) return raw;
  return 1;
}

export async function checkAvailability(
  dateInput: string,
  ctx: ApiContext,
): Promise<AvailabilityResult> {
  const date = normalizeDate(dateInput);
  if (!isValidIsoDate(date)) {
    return { ok: false, error: "Invalid date. Use YYYY-MM-DD." };
  }
  if (date < todayIso()) {
    return { ok: false, error: "That date is in the past. Pick a future date." };
  }

  const bookings = await ctx.store.list();
  const active = bookings.filter(
    (booking) => booking.date === date && booking.status !== "cancelled",
  );
  const capacity = getSlotCapacity(ctx.env);

  const slots = BOOKING_TIME_SLOTS.map((slot) => {
    const booked = active.filter((booking) => booking.timeSlot === slot).length;
    return { slot, booked, available: booked < capacity };
  });

  return {
    ok: true,
    date,
    capacity,
    slots,
    availableSlots: slots.filter((s) => s.available).map((s) => s.slot),
  };
}

export interface ToolExecutionOptions {
  /** All patient-authored text in the conversation, used to block fabricated details. */
  userText?: string;
  /** True when a booking already exists in this conversation. */
  bookingLocked?: boolean;
}

export async function createChatBooking(
  args: Record<string, unknown>,
  ctx: ApiContext,
  options: ToolExecutionOptions = {},
): Promise<CreateBookingResult> {
  const parsed = parseBookingInput({
    name: asString(args.name),
    email: asString(args.email),
    phone: asString(args.phone),
    service: asString(args.service),
    date: asString(args.date),
    timeSlot: asString(args.timeSlot),
    notes: asString(args.notes),
    duration: asString(args.duration),
    symptoms: asString(args.symptoms),
    concerns: asStringArray(args.concerns),
    conditions: asStringArray(args.conditions),
    source: "chatbot",
  });

  if (!parsed.ok || !parsed.value) {
    return { ok: false, errors: parsed.errors };
  }

  const value = parsed.value;
  value.service = normalizeService(value.service);
  if (value.date) value.date = normalizeDate(value.date);
  if (value.timeSlot) value.timeSlot = normalizeTimeSlot(value.timeSlot);

  if (options.bookingLocked) {
    return {
      ok: false,
      errors: [
        "This patient already has a confirmed booking in this conversation. Do not create another one.",
      ],
    };
  }

  if (!value.date) {
    return {
      ok: false,
      errors: [
        "A specific date is required. Ask the patient which day works for them before booking.",
      ],
    };
  }
  if (!value.timeSlot) {
    return {
      ok: false,
      errors: [
        "A preferred time window is required. Ask the patient whether Morning, Afternoon, or Evening suits them.",
      ],
    };
  }

  const haystack = (options.userText ?? "").toLowerCase();
  if (haystack) {
    if (!haystack.includes(value.email.toLowerCase())) {
      return {
        ok: false,
        errors: [
          "The email address was not provided by the patient. Ask them for it and wait for their reply before booking.",
        ],
      };
    }
    const nameTokens = value.name
      .toLowerCase()
      .split(/\s+/)
      .filter((token) => token.length >= 2);
    if (
      nameTokens.length === 0 ||
      !nameTokens.some((token) => haystack.includes(token))
    ) {
      return {
        ok: false,
        errors: [
          "The patient's name was not provided. Ask them for it and wait for their reply before booking. Never use a placeholder name.",
        ],
      };
    }
    if (!DATE_SIGNAL.test(haystack)) {
      return {
        ok: false,
        errors: [
          "The patient has not said which day they want. Ask them for a day before booking; never pick one yourself.",
        ],
      };
    }
    if (!TIME_SIGNAL.test(haystack)) {
      return {
        ok: false,
        errors: [
          "The patient has not said a preferred time of day. Ask them before booking; never pick one yourself.",
        ],
      };
    }
  }

  if (value.date && value.timeSlot) {
    const availability = await checkAvailability(value.date, ctx);
    if (
      availability.ok &&
      availability.availableSlots &&
      !availability.availableSlots.includes(value.timeSlot as BookingTimeSlot)
    ) {
      return {
        ok: false,
        errors: [
          `The ${value.timeSlot} window on ${value.date} is no longer available.`,
        ],
        availableSlots: availability.availableSlots,
      };
    }
  }

  const booking: Booking = await ctx.store.create(value);
  return {
    ok: true,
    booking: {
      id: booking.id,
      name: booking.name,
      service: booking.service,
      date: booking.date,
      timeSlot: booking.timeSlot,
    },
  };
}

export async function executeTool(
  call: ToolCall,
  ctx: ApiContext,
  options: ToolExecutionOptions = {},
): Promise<unknown> {
  const args = call.arguments ?? {};
  switch (call.name) {
    case "check_availability":
      return checkAvailability(asString(args.date), ctx);
    case "create_booking":
      return createChatBooking(args, ctx, options);
    default:
      return { ok: false, error: `Unknown tool: ${call.name}` };
  }
}
