import type { BookingInput, BookingSource } from "../types";

const SOURCES: BookingSource[] = ["website", "chatbot", "admin"];

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return fallback;
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => asString(item))
      .filter((item) => item.length > 0);
  }
  if (typeof value === "string" && value.trim()) {
    const trimmed = value.trim();
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        if (Array.isArray(parsed)) {
          return parsed
            .map((item) => asString(item))
            .filter((item) => item.length > 0);
        }
      } catch {
        // not valid JSON, fall through to delimiter splitting
      }
    }
    return trimmed
      .split(/[;,\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function asSource(value: unknown): BookingSource {
  const source = asString(value) as BookingSource;
  return SOURCES.includes(source) ? source : "website";
}

export interface ParseResult {
  ok: boolean;
  errors: string[];
  value?: BookingInput;
}

export function parseBookingInput(body: unknown): ParseResult {
  const errors: string[] = [];
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, errors: ["Request body must be a JSON object."] };
  }

  const raw = body as Record<string, unknown>;
  const name = asString(raw.name);
  const email = asString(raw.email);
  const service = asString(raw.service);

  if (!name) errors.push("`name` is required.");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("`email` must be a valid email address.");
  }
  if (!service) errors.push("`service` is required.");

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    errors: [],
    value: {
      name,
      email,
      service,
      phone: asString(raw.phone),
      date: asString(raw.date),
      timeSlot: asString(raw.timeSlot),
      notes: asString(raw.notes),
      duration: asString(raw.duration),
      symptoms: asString(raw.symptoms),
      concerns: asStringArray(raw.concerns),
      conditions: asStringArray(raw.conditions),
      source: asSource(raw.source),
    },
  };
}
