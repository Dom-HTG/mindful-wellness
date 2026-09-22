import type { AdminUser } from "../types";

const JWK_URL =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

interface JwkKey {
  kid: string;
  kty: string;
  n: string;
  e: string;
  alg?: string;
  use?: string;
}

interface JwtHeader {
  alg?: string;
  kid?: string;
}

interface JwtPayload {
  iss?: string;
  aud?: string;
  exp?: number;
  iat?: number;
  sub?: string;
  user_id?: string;
  email?: string;
  name?: string;
  picture?: string;
}

let cachedKeys: { keys: JwkKey[]; expiresAt: number } | null = null;

function base64UrlDecode(input: string): Uint8Array {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function decodeJson<T>(part: string): T {
  return JSON.parse(new TextDecoder().decode(base64UrlDecode(part))) as T;
}

async function loadKeys(force = false): Promise<JwkKey[]> {
  if (!force && cachedKeys && cachedKeys.expiresAt > Date.now()) {
    return cachedKeys.keys;
  }

  const response = await fetch(JWK_URL);
  if (!response.ok) {
    throw new Error("Unable to fetch Firebase signing keys.");
  }

  const data = (await response.json()) as { keys?: JwkKey[] };
  const keys = Array.isArray(data.keys) ? data.keys : [];

  let maxAge = 3600;
  const cacheControl = response.headers.get("cache-control") ?? "";
  const match = /max-age=(\d+)/.exec(cacheControl);
  if (match) maxAge = Number(match[1]) || maxAge;

  cachedKeys = { keys, expiresAt: Date.now() + maxAge * 1000 };
  return keys;
}

async function verifySignature(
  token: string,
  key: JwkKey,
): Promise<boolean> {
  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) return false;

  const cryptoKey = await crypto.subtle.importKey(
    "jwk",
    {
      kty: key.kty,
      n: key.n,
      e: key.e,
      alg: "RS256",
      ext: true,
    },
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );

  return crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    base64UrlDecode(signature),
    new TextEncoder().encode(`${header}.${payload}`),
  );
}

export async function verifyFirebaseIdToken(
  token: string,
  projectId: string,
): Promise<AdminUser | null> {
  if (!projectId) {
    throw new Error(
      "Firebase project id is not configured. Set FIREBASE_PROJECT_ID.",
    );
  }

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const header = decodeJson<JwtHeader>(parts[0]);
  if (header.alg !== "RS256" || !header.kid) return null;

  let keys = await loadKeys();
  let key = keys.find((candidate) => candidate.kid === header.kid);
  if (!key) {
    keys = await loadKeys(true);
    key = keys.find((candidate) => candidate.kid === header.kid);
  }
  if (!key) return null;

  if (!(await verifySignature(token, key))) return null;

  const payload = decodeJson<JwtPayload>(parts[1]);
  const now = Math.floor(Date.now() / 1000);

  if (payload.aud !== projectId) return null;
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) return null;
  if (typeof payload.exp !== "number" || payload.exp <= now) return null;
  if (typeof payload.iat !== "number" || payload.iat > now + 300) return null;

  const uid = payload.sub || payload.user_id;
  if (!uid) return null;

  return {
    uid,
    email: payload.email ?? "",
    name: payload.name ?? "",
    picture: payload.picture ?? "",
  };
}
