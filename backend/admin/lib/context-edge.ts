import type {
  Booking,
  BookingInput,
  BookingUpdate,
} from "../types";
import {
  getFirebaseProjectId,
  isFirebaseConfigured,
  normalizeEnv,
} from "./config";
import type { AiBinding, ApiContext } from "./context";
import { verifyFirebaseIdToken } from "./firebase-auth";
import { FirestoreRestStore } from "./firestore-rest";
import type { BookingStore } from "./store";

class UnconfiguredStore implements BookingStore {
  private fail(): never {
    throw new Error(
      "Firestore is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY as Worker secrets.",
    );
  }

  async list(): Promise<Booking[]> {
    this.fail();
  }

  async get(): Promise<Booking | null> {
    this.fail();
  }

  async create(_input: BookingInput): Promise<Booking> {
    void _input;
    this.fail();
  }

  async update(
    _id: string,
    _update: BookingUpdate,
    _actor: string,
  ): Promise<Booking | null> {
    void _id;
    void _update;
    void _actor;
    this.fail();
  }
}

export function createEdgeContext(env: Record<string, unknown>): ApiContext {
  const normalized = normalizeEnv({ NODE_ENV: "production", ...env });
  const store = isFirebaseConfigured(normalized)
    ? new FirestoreRestStore(normalized)
    : new UnconfiguredStore();
  const projectId = getFirebaseProjectId(normalized);
  const ai = env.AI as AiBinding | undefined;

  return {
    env: normalized,
    store,
    ai,
    verifyToken: (token) => verifyFirebaseIdToken(token, projectId),
  };
}
