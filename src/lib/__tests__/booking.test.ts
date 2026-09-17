import { describe, it, expect } from "vitest";
import {
  buildBookingPayload,
  buildBookingUrl,
  buildMailtoUrl,
  type BookingFormData,
} from "../booking";
import { CLINIC_CONFIG } from "../config";

const baseData: BookingFormData = {
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "555-1234",
  service: "Medical Management",
  date: "2026-09-18",
  timeSlot: "Morning",
  notes: "",
  concerns: ["Binge / Emotional / Stress-Induced Eating"],
  conditions: [],
  duration: "1-3 Years",
  symptoms: "None",
};

describe("buildBookingPayload", () => {
  it("includes contact, appointment, and survey sections", () => {
    const payload = buildBookingPayload(baseData);
    expect(payload).toContain("Jane Doe");
    expect(payload).toContain("jane@example.com");
    expect(payload).toContain("Medical Management");
    expect(payload).toContain("Binge / Emotional / Stress-Induced Eating");
    expect(payload).toContain("1-3 Years");
  });

  it("falls back gracefully for empty lists", () => {
    const payload = buildBookingPayload(baseData);
    expect(payload).toContain("None reported");
  });
});

describe("buildMailtoUrl", () => {
  it("targets the clinic email with encoded subject and body", () => {
    const url = buildMailtoUrl("hello world");
    expect(url).toContain(`mailto:${CLINIC_CONFIG.email}`);
    expect(url).toContain("subject=");
    expect(url).toContain("body=hello%20world");
  });
});

describe("buildBookingUrl", () => {
  it("appends a service query param and book hash", () => {
    const url = buildBookingUrl("Medical Management");
    expect(url).toBe(
      `${CLINIC_CONFIG.productionUrl}?service=Medical%20Management#book`,
    );
  });

  it("uses a plain book hash when no service", () => {
    const url = buildBookingUrl("");
    expect(url).toBe(`${CLINIC_CONFIG.productionUrl}#book`);
  });
});
