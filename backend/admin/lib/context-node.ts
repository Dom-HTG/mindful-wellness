import {
  getFirebaseProjectId,
  isFirebaseConfigured,
  normalizeEnv,
  type EnvRecord,
} from "./config";
import type { ApiContext } from "./context";
import { verifyFirebaseIdToken } from "./firebase-auth";
import { FirestoreRestStore } from "./firestore-rest";
import { FileStore } from "./store-file";

export function createNodeContext(env?: EnvRecord): ApiContext {
  const normalized = normalizeEnv(
    env ?? (globalThis as { process?: { env?: EnvRecord } }).process?.env,
  );
  const store = isFirebaseConfigured(normalized)
    ? new FirestoreRestStore(normalized)
    : new FileStore(normalized);
  const projectId = getFirebaseProjectId(normalized);

  return {
    env: normalized,
    store,
    verifyToken: (token) => verifyFirebaseIdToken(token, projectId),
  };
}
