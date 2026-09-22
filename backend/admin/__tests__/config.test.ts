// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  getFirebaseProjectId,
  getServiceAccount,
  isFirebaseConfigured,
} from "../lib/config";

const account = {
  type: "service_account",
  project_id: "mindfulwellness-f3218",
  client_email: "admin@mindfulwellness-f3218.iam.gserviceaccount.com",
  private_key: "-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n",
};

const json = JSON.stringify(account);
const base64 = Buffer.from(json, "utf8").toString("base64");

describe("getServiceAccount", () => {
  it("parses raw JSON", () => {
    const sa = getServiceAccount({ FIREBASE_SERVICE_ACCOUNT: json });
    expect(sa?.project_id).toBe(account.project_id);
    expect(sa?.private_key).toContain("\nabc\n");
  });

  it("parses base64-encoded JSON", () => {
    const sa = getServiceAccount({ FIREBASE_SERVICE_ACCOUNT: base64 });
    expect(sa?.client_email).toBe(account.client_email);
  });

  it("parses padded base64 that contains no + or / characters", () => {
    const padded =
      "eyJwcm9qZWN0X2lkIjoicDAiLCJjbGllbnRfZW1haWwiOiJlMCIsInByaXZhdGVfa2V5IjoiazAifQ==";
    const sa = getServiceAccount({ FIREBASE_SERVICE_ACCOUNT: padded });
    expect(sa?.project_id).toBe("p0");
    expect(sa?.client_email).toBe("e0");
  });

  it("parses a pasted .env line including the key prefix", () => {
    const sa = getServiceAccount({
      FIREBASE_SERVICE_ACCOUNT: `FIREBASE_SERVICE_ACCOUNT=${json}`,
    });
    expect(sa?.project_id).toBe(account.project_id);
  });

  it("parses a quoted multi-line paste", () => {
    const sa = getServiceAccount({
      FIREBASE_SERVICE_ACCOUNT: `"${json}"`,
    });
    expect(sa?.project_id).toBe(account.project_id);
  });

  it("falls back to individual fields", () => {
    const sa = getServiceAccount({
      FIREBASE_PROJECT_ID: "p",
      FIREBASE_CLIENT_EMAIL: "e@x",
      FIREBASE_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\\nkey\\n-----END PRIVATE KEY-----\\n",
    });
    expect(sa?.project_id).toBe("p");
    expect(isFirebaseConfigured({
      FIREBASE_PROJECT_ID: "p",
      FIREBASE_CLIENT_EMAIL: "e@x",
      FIREBASE_PRIVATE_KEY: "key",
    })).toBe(true);
  });

  it("derives the project id from the service account", () => {
    expect(
      getFirebaseProjectId({ FIREBASE_SERVICE_ACCOUNT: json }),
    ).toBe(account.project_id);
  });

  it("returns null when nothing is configured", () => {
    expect(getServiceAccount({})).toBeNull();
    expect(isFirebaseConfigured({})).toBe(false);
  });
});
