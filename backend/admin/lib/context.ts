import type { AdminUser } from "../types";
import type { EnvRecord } from "./config";
import type { BookingStore } from "./store";

export interface ApiContext {
  env: EnvRecord;
  store: BookingStore;
  verifyToken(token: string): Promise<AdminUser | null>;
}
