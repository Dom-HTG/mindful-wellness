import type {
  Booking,
  BookingInput,
  BookingUpdate,
} from "../types";
import type { EnvRecord } from "./config";
import {
  applyUpdate,
  newBookingId,
  normalizeBooking,
  toBooking,
  type BookingStore,
} from "./store";

interface FileStoreData {
  bookings: Booking[];
}

export class FileStore implements BookingStore {
  private cache: FileStoreData | null = null;

  constructor(private readonly env: EnvRecord = {}) {}

  private get filePath(): string {
    const dir =
      this.env.ADMIN_DATA_DIR ??
      `${(globalThis as { process?: { cwd?: () => string } }).process?.cwd?.() ?? "."}/backend/admin/.data`;
    return `${dir}/bookings.json`;
  }

  private async load(): Promise<FileStoreData> {
    if (this.cache) return this.cache;
    const fs = await import("node:fs/promises");
    try {
      const raw = await fs.readFile(this.filePath, "utf8");
      const parsed = JSON.parse(raw) as Partial<FileStoreData>;
      this.cache = {
        bookings: Array.isArray(parsed.bookings)
          ? parsed.bookings.map((b) =>
              normalizeBooking(b.id, b as Partial<Booking>),
            )
          : [],
      };
    } catch {
      this.cache = { bookings: [] };
    }
    return this.cache;
  }

  private async persist(data: FileStoreData): Promise<void> {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(
      this.filePath,
      JSON.stringify(data, null, 2),
      "utf8",
    );
    this.cache = data;
  }

  async list(): Promise<Booking[]> {
    const data = await this.load();
    return [...data.bookings].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }

  async get(id: string): Promise<Booking | null> {
    const data = await this.load();
    return data.bookings.find((b) => b.id === id) ?? null;
  }

  async create(input: BookingInput): Promise<Booking> {
    const data = await this.load();
    const booking = toBooking(newBookingId(), input);
    data.bookings.push(booking);
    await this.persist(data);
    return booking;
  }

  async update(
    id: string,
    update: BookingUpdate,
    actor: string,
  ): Promise<Booking | null> {
    const data = await this.load();
    const index = data.bookings.findIndex((b) => b.id === id);
    if (index === -1) return null;
    const next = applyUpdate(data.bookings[index], update, actor);
    data.bookings[index] = next;
    await this.persist(data);
    return next;
  }
}
