export type EnvRecord = Record<string, string | undefined>;

function defaultEnv(): EnvRecord {
  const proc = (globalThis as { process?: { env?: EnvRecord } }).process;
  return proc?.env ?? {};
}

export function normalizeEnv(env: EnvRecord | undefined | null): EnvRecord {
  const out: EnvRecord = {};
  if (!env) return out;
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === "string") out[key] = value;
  }
  return out;
}

function readEnv(env: EnvRecord, key: string): string {
  const value = env[key];
  return typeof value === "string" ? value.trim() : "";
}

function decodeBase64Utf8(input: string): string {
  const binary = atob(input);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export function getAdminEmails(env: EnvRecord = defaultEnv()): string[] {
  return readEnv(env, "ADMIN_EMAILS")
    .split(/[,\s;]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(
  email: string | undefined | null,
  env: EnvRecord = defaultEnv(),
): boolean {
  if (!email) return false;
  const allowed = getAdminEmails(env);
  if (allowed.length === 0) {
    return isDevMode(env);
  }
  return allowed.includes(email.trim().toLowerCase());
}

export function getServiceAccount(
  env: EnvRecord = defaultEnv(),
): Record<string, string> | null {
  const raw = readEnv(env, "FIREBASE_SERVICE_ACCOUNT");
  if (raw) {
    try {
      const json = raw.startsWith("{") ? raw : decodeBase64Utf8(raw);
      const parsed = JSON.parse(json) as Record<string, string>;
      if (parsed.project_id && parsed.client_email && parsed.private_key) {
        return {
          ...parsed,
          private_key: parsed.private_key.replace(/\\n/g, "\n"),
        };
      }
    } catch {
      return null;
    }
  }

  const projectId = readEnv(env, "FIREBASE_PROJECT_ID");
  const clientEmail = readEnv(env, "FIREBASE_CLIENT_EMAIL");
  const privateKey = readEnv(env, "FIREBASE_PRIVATE_KEY");
  if (projectId && clientEmail && privateKey) {
    return {
      project_id: projectId,
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, "\n"),
    };
  }

  return null;
}

export function isFirebaseConfigured(env: EnvRecord = defaultEnv()): boolean {
  return getServiceAccount(env) !== null;
}

export function getFirebaseProjectId(env: EnvRecord = defaultEnv()): string {
  const explicit = readEnv(env, "FIREBASE_PROJECT_ID");
  if (explicit) return explicit;
  return getServiceAccount(env)?.project_id ?? "";
}

export function isDevMode(env: EnvRecord = defaultEnv()): boolean {
  const explicit = readEnv(env, "ADMIN_DEV_MODE").toLowerCase();
  if (explicit === "true") return true;
  if (explicit === "false") return false;
  return readEnv(env, "NODE_ENV") !== "production" && !isFirebaseConfigured(env);
}

export function getBookingsCollection(env: EnvRecord = defaultEnv()): string {
  return readEnv(env, "BOOKINGS_COLLECTION") || "bookings";
}
