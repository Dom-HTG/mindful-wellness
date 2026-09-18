export interface QuizOption {
  value: string;
  label: string;
}

export interface QuizQuestion {
  id: number;
  prompt: string;
  options: QuizOption[];
}

export interface QuizResult {
  title: string;
  description: string;
  recommendedService: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    prompt: "What has been your primary challenge with weight management?",
    options: [
      {
        value: "Stress & Emotional Eating",
        label: "Stress, anxiety, or late-night emotional eating",
      },
      {
        value: "Metabolic Plateau",
        label: "Unexplained weight plateau or metabolic changes",
      },
      {
        value: "Restrictive Diet Burnout",
        label: "Fatigue from strict diets and calorie counting",
      },
      {
        value: "Lack of Holistic Direction",
        label: "Seeking clinical, medical & mental health harmony",
      },
    ],
  },
  {
    id: 2,
    prompt: "Which aspect of care is most important for your long-term success?",
    options: [
      {
        value: "Psychological & Behavioral Guidance",
        label: "Behavioral therapy & cognitive habit rewiring",
      },
      {
        value: "Medical & Lab Diagnostics",
        label: "Clinical evaluations, labs & physiological tracking",
      },
      {
        value: "Mindful Intuitive Nutrition",
        label: "Flexible, nourishing meal framework without shaming",
      },
      {
        value: "All-in-One Integrated Care",
        label: "An integrated combination of all three pillars",
      },
    ],
  },
  {
    id: 3,
    prompt: "What is your primary personal target for the next 90 days?",
    options: [
      {
        value: "Sustainable Weight Reduction",
        label: "Losing weight sustainably without anxiety",
      },
      {
        value: "Emotional Freedom with Food",
        label: "Ending guilt and stress around daily meals",
      },
      {
        value: "Improved Vitality & Energy",
        label: "Regaining physical stamina & restorative sleep",
      },
      {
        value: "Complete Health Assessment",
        label: "Full clinical diagnostic & custom strategy blueprint",
      },
    ],
  },
];

export const QUIZ_ACTION_PLAN = [
  "1-on-1 Cognitive Behavioral Intake Session",
  "Comprehensive Metabolic Baseline Assessment",
  "Intuitive Mindful Nutrition Framework",
];

export function scoreQuiz(answers: Record<number, string>): QuizResult {
  const ans1 = answers[1] ?? "";
  const ans2 = answers[2] ?? "";

  if (ans1.includes("Stress") || ans2.includes("Psychological")) {
    return {
      title: "Recommended Blueprint: Psychological & Behavioral Focus",
      description:
        "Your primary key to sustainable weight loss lies in cognitive emotional alignment, stress regulation, and ending diet fatigue.",
      recommendedService: "Psychological Counseling",
    };
  }
  if (ans1.includes("Metabolic") || ans2.includes("Medical")) {
    return {
      title: "Recommended Blueprint: Clinical & Metabolic Management",
      description:
        "Your path will benefit greatly from clinical diagnostic evaluations, lab screenings, and biological progression tracking.",
      recommendedService: "Medical Management",
    };
  }
  return {
    title: "Recommended Blueprint: Holistic 360° Care Integration",
    description:
      "You will excel in our comprehensive care model combining behavioral counseling, medical monitoring, and non-restrictive nutrition.",
    recommendedService: "Psychological Counseling",
  };
}

export function recommendedServiceFromAnswers(
  answers: Record<number, string>,
): string {
  const ans1 = answers[1] ?? "";
  const ans2 = answers[2] ?? "";
  if (ans2.includes("Medical") || ans1.includes("Metabolic")) {
    return "Medical Management";
  }
  if (ans2.includes("Nutrition")) {
    return "Nutritional Counseling";
  }
  return "Psychological Counseling";
}

export function buildQuizNotes(answers: Record<number, string>): string {
  return `[Quiz Results] Challenge: ${answers[1] ?? ""} | Preferred Focus: ${
    answers[2] ?? ""
  } | Target: ${answers[3] ?? "Sustainable Wellness"}`;
}
