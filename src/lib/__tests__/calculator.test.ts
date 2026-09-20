import { describe, it, expect } from "vitest";
import { computeWellness } from "../calculator";

describe("computeWellness", () => {
  it("computes default baseline (160 lbs, 30 min, 7.5 hrs)", () => {
    const r = computeWellness(160, 30, 7.5);
    expect(r.waterOz).toBe(92);
    expect(r.waterCups).toBe("11.5");
    expect(r.recoveryScore).toBe(87);
    expect(r.status).toBe("optimal");
  });

  it("computes a low-activity, low-sleep baseline as rest", () => {
    const r = computeWellness(90, 0, 4);
    expect(r.waterOz).toBe(45);
    expect(r.status).toBe("rest");
    expect(r.statusLabel).toBe("Rest Needed");
  });

  it("treats non-numeric input as defaults", () => {
    const r = computeWellness(Number.NaN, Number.NaN, Number.NaN);
    expect(r.waterOz).toBe(92);
  });

  it("caps recovery score at 100", () => {
    const r = computeWellness(350, 120, 11);
    expect(r.recoveryScore).toBe(100);
    expect(r.status).toBe("optimal");
  });
});
