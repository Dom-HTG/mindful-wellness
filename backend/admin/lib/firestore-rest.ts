import type {
  Booking,
  BookingInput,
  BookingUpdate,
} from "../types";
import {
  getBookingsCollection,
  getFirebaseProjectId,
  type EnvRecord,
} from "./config";
import { getGoogleAccessToken } from "./google-auth";
import {
  applyUpdate,
  newBookingId,
  normalizeBooking,
  toBooking,
  type BookingStore,
} from "./store";

type FirestoreValue = Record<string, unknown>;

interface FirestoreDocument {
  name: string;
  fields?: Record<string, FirestoreValue>;
}

const PAGE_SIZE = 300;

function encodeValue(value: unknown): FirestoreValue {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map((item) => encodeValue(item)) } };
  }
  if (typeof value === "object") {
    return { mapValue: { fields: encodeFields(value as object) } };
  }
  return { stringValue: String(value) };
}

export function encodeFields(data: object): Record<string, FirestoreValue> {
  const fields: Record<string, FirestoreValue> = {};
  for (const [key, value] of Object.entries(data)) {
    fields[key] = encodeValue(value);
  }
  return fields;
}

function decodeValue(value: FirestoreValue): unknown {
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("nullValue" in value) return null;
  if ("timestampValue" in value) return value.timestampValue;
  if ("arrayValue" in value) {
    const array = value.arrayValue as { values?: FirestoreValue[] } | undefined;
    return (array?.values ?? []).map((item) => decodeValue(item));
  }
  if ("mapValue" in value) {
    const map = value.mapValue as
      | { fields?: Record<string, FirestoreValue> }
      | undefined;
    return decodeFields(map?.fields ?? {});
  }
  return undefined;
}

export function decodeFields(
  fields: Record<string, FirestoreValue>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    out[key] = decodeValue(value);
  }
  return out;
}

function documentId(doc: FirestoreDocument): string {
  const segments = doc.name.split("/");
  return segments[segments.length - 1];
}

export class FirestoreRestStore implements BookingStore {
  constructor(private readonly env: EnvRecord) {}

  private get projectId(): string {
    return getFirebaseProjectId(this.env);
  }

  private get collection(): string {
    return getBookingsCollection(this.env);
  }

  private get baseUrl(): string {
    return `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents`;
  }

  private async headers(): Promise<Record<string, string>> {
    const token = await getGoogleAccessToken(this.env);
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  private async request(
    url: string,
    init?: RequestInit,
  ): Promise<Response> {
    const response = await fetch(url, {
      ...init,
      headers: { ...(await this.headers()), ...(init?.headers ?? {}) },
    });
    return response;
  }

  async list(): Promise<Booking[]> {
    const bookings: Booking[] = [];
    let pageToken: string | undefined;

    do {
      const url = new URL(`${this.baseUrl}/${this.collection}`);
      url.searchParams.set("pageSize", String(PAGE_SIZE));
      if (pageToken) url.searchParams.set("pageToken", pageToken);

      const response = await this.request(url.toString());
      if (!response.ok) {
        throw new Error(
          `Firestore list failed (${response.status}): ${(await response.text()).slice(0, 300)}`,
        );
      }

      const data = (await response.json()) as {
        documents?: FirestoreDocument[];
        nextPageToken?: string;
      };

      for (const doc of data.documents ?? []) {
        bookings.push(
          normalizeBooking(
            documentId(doc),
            decodeFields(doc.fields ?? {}) as Partial<Booking>,
          ),
        );
      }

      pageToken = data.nextPageToken;
    } while (pageToken);

    return bookings.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async get(id: string): Promise<Booking | null> {
    const response = await this.request(
      `${this.baseUrl}/${this.collection}/${encodeURIComponent(id)}`,
    );
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(
        `Firestore get failed (${response.status}): ${(await response.text()).slice(0, 300)}`,
      );
    }
    const doc = (await response.json()) as FirestoreDocument;
    return normalizeBooking(
      documentId(doc),
      decodeFields(doc.fields ?? {}) as Partial<Booking>,
    );
  }

  async create(input: BookingInput): Promise<Booking> {
    const id = newBookingId();
    const booking = toBooking(id, input);
    const response = await this.request(
      `${this.baseUrl}/${this.collection}?documentId=${encodeURIComponent(id)}`,
      {
        method: "POST",
        body: JSON.stringify({ fields: encodeFields(booking) }),
      },
    );
    if (!response.ok) {
      throw new Error(
        `Firestore create failed (${response.status}): ${(await response.text()).slice(0, 300)}`,
      );
    }
    return booking;
  }

  async update(
    id: string,
    update: BookingUpdate,
    actor: string,
  ): Promise<Booking | null> {
    const current = await this.get(id);
    if (!current) return null;

    const next = applyUpdate(current, update, actor);
    const response = await this.request(
      `${this.baseUrl}/${this.collection}/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ fields: encodeFields(next) }),
      },
    );
    if (!response.ok) {
      throw new Error(
        `Firestore update failed (${response.status}): ${(await response.text()).slice(0, 300)}`,
      );
    }
    return next;
  }
}
