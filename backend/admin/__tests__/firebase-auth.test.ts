// @vitest-environment node
import { createSign, generateKeyPairSync } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { verifyFirebaseIdToken } from "../lib/firebase-auth";

const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
});

const jwk = publicKey.export({ format: "jwk" }) as {
  kty: string;
  n: string;
  e: string;
};
const KID = "test-kid";
const PROJECT_ID = "test-project";

function base64Url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

interface Claims {
  iss?: string;
  aud?: string;
  exp?: number;
  iat?: number;
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
}

function signToken(claims: Claims = {}): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT", kid: KID };
  const payload: Claims = {
    iss: `https://securetoken.google.com/${PROJECT_ID}`,
    aud: PROJECT_ID,
    iat: now,
    exp: now + 3600,
    sub: "uid-1",
    email: "admin@mindfulwellness.io",
    ...claims,
  };
  const signingInput = `${base64Url(JSON.stringify(header))}.${base64Url(
    JSON.stringify(payload),
  )}`;
  const signature = createSign("RSA-SHA256")
    .update(signingInput)
    .sign(privateKey);
  return `${signingInput}.${base64Url(signature)}`;
}

describe("verifyFirebaseIdToken", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            keys: [{ ...jwk, kid: KID, use: "sig", alg: "RS256" }],
          }),
          {
            status: 200,
            headers: { "cache-control": "public, max-age=3600" },
          },
        ),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("accepts a correctly signed token and returns the admin user", async () => {
    const user = await verifyFirebaseIdToken(signToken(), PROJECT_ID);
    expect(user).toEqual({
      uid: "uid-1",
      email: "admin@mindfulwellness.io",
      name: "",
      picture: "",
    });
  });

  it("rejects a token for a different project audience", async () => {
    const user = await verifyFirebaseIdToken(
      signToken({ aud: "other-project" }),
      PROJECT_ID,
    );
    expect(user).toBeNull();
  });

  it("rejects an expired token", async () => {
    const now = Math.floor(Date.now() / 1000);
    const user = await verifyFirebaseIdToken(
      signToken({ iat: now - 7200, exp: now - 3600 }),
      PROJECT_ID,
    );
    expect(user).toBeNull();
  });

  it("rejects a token with a tampered signature", async () => {
    const token = signToken();
    const parts = token.split(".");
    const tampered = `${parts[0]}.${parts[1]}.${base64Url("nope")}`;
    expect(await verifyFirebaseIdToken(tampered, PROJECT_ID)).toBeNull();
  });
});
