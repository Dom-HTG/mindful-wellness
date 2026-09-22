import type { AdminUser } from "../types";
import type { EnvRecord } from "./config";
import type { BookingStore } from "./store";

export interface AiBinding {
  run(model: string, input: Record<string, unknown>): Promise<unknown>;
}

export interface ApiContext {
  env: EnvRecord;
  store: BookingStore;
  verifyToken(token: string): Promise<AdminUser | null>;
  ai?: AiBinding;
}
