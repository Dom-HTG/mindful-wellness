import { describe, it, expect } from "vitest";
import {
  scoreQuiz,
  recommendedServiceFromAnswers,
  buildQuizNotes,
} from "../quiz";

describe("scoreQuiz", () => {
  it("routes stress/psychological answers to behavioral focus", () => {
    const r = scoreQuiz({
      1: "Stress & Emotional Eating",
      2: "Mindful Intuitive Nutrition",
      3: "Sustainable Weight Reduction",
    });
    expect(r.title).toContain("Psychological & Behavioral");
  });

  it("routes metabolic answers to nutrition focus", () => {
    const r = scoreQuiz({
      1: "Metabolic Plateau",
      2: "Metabolic & Lifestyle Guidance",
      3: "Complete Health Assessment",
    });
    expect(r.title).toContain("Nutrition & Metabolic");
  });

  it("defaults to holistic integration otherwise", () => {
    const r = scoreQuiz({
      1: "Restrictive Diet Burnout",
      2: "All-in-One Integrated Care",
      3: "Emotional Freedom with Food",
    });
    expect(r.title).toContain("Holistic");
  });
});

describe("recommendedServiceFromAnswers", () => {
  it("recommends nutritional counseling for metabolic answers", () => {
    expect(
      recommendedServiceFromAnswers({ 1: "Metabolic Plateau", 2: "All-in-One Integrated Care" }),
    ).toBe("Nutritional Counseling");
  });

  it("recommends nutritional counseling for nutrition answers", () => {
    expect(
      recommendedServiceFromAnswers({ 1: "Stress & Emotional Eating", 2: "Mindful Intuitive Nutrition" }),
    ).toBe("Nutritional Counseling");
  });

  it("defaults to psychological counseling", () => {
    expect(recommendedServiceFromAnswers({ 1: "x", 2: "y" })).toBe(
      "Psychological Counseling",
    );
  });
});

describe("buildQuizNotes", () => {
  it("includes the chosen answers", () => {
    const notes = buildQuizNotes({
      1: "Stress & Emotional Eating",
      2: "Mindful Intuitive Nutrition",
      3: "Improved Vitality & Energy",
    });
    expect(notes).toContain("Stress & Emotional Eating");
    expect(notes).toContain("Mindful Intuitive Nutrition");
    expect(notes).toContain("Improved Vitality & Energy");
  });
});
