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

function extractJsonObject(input: string): string | null {
  const start = input.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < input.length; i += 1) {
    const ch = input[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return input.slice(start, i + 1);
    }
  }
  return null;
}

function normalizeServiceAccount(
  parsed: Record<string, unknown>,
): Record<string, string> | null {
  const projectId = typeof parsed.project_id === "string" ? parsed.project_id : "";
  const clientEmail =
    typeof parsed.client_email === "string" ? parsed.client_email : "";
  const privateKey =
    typeof parsed.private_key === "string" ? parsed.private_key : "";
  if (!projectId || !clientEmail || !privateKey) return null;
  return {
    project_id: projectId,
    client_email: clientEmail,
    private_key: privateKey.replace(/\\n/g, "\n"),
  };
}

function tryParseJson(text: string): Record<string, string> | null {
  const objectText = extractJsonObject(text);
  if (!objectText) return null;
  try {
    return normalizeServiceAccount(
      JSON.parse(objectText) as Record<string, unknown>,
    );
  } catch {
    return null;
  }
}

function tryParseBase64(text: string): Record<string, string> | null {
  try {
    return tryParseJson(decodeBase64Utf8(text.replace(/\s+/g, "")));
  } catch {
    return null;
  }
}

function parseServiceAccount(raw: string): Record<string, string> | null {
  let value = raw.trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  const direct = tryParseJson(value) ?? tryParseBase64(value);
  if (direct) return direct;

  const eq = value.indexOf("=");
  if (eq > 0) {
    const head = value.slice(0, eq).trim();
    const tail = value.slice(eq + 1).trim();
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(head)) {
      return tryParseJson(tail) ?? tryParseBase64(tail);
    }
  }

  return null;
}

export function getServiceAccount(
  env: EnvRecord = defaultEnv(),
): Record<string, string> | null {
  const raw = readEnv(env, "FIREBASE_SERVICE_ACCOUNT");
  if (raw) {
    const account = parseServiceAccount(raw);
    if (account) return account;
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

export function isFirebaseConfigured(env: EnvRecord = defaultEnv()): boolean {
  return getServiceAccount(env) !== null;
}

export function getFirebaseProjectId(env: EnvRecord = defaultEnv()): string {
  const explicit =
    readEnv(env, "FIREBASE_PROJECT_ID") ||
    readEnv(env, "VITE_FIREBASE_PROJECT_ID");
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
