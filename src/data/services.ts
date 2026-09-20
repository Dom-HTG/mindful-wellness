import type { Icon } from "@phosphor-icons/react";
import { Brain, BowlFood, Sparkle } from "@phosphor-icons/react";

export interface Service {
  icon: Icon;
  name: string;
  description: string;
  bullets: string[];
  featured?: boolean;
}

export const SERVICES: Service[] = [
  {
    icon: Brain,
    name: "Psychological Counseling",
    description:
      "Understand the core drivers of your eating habits. Our tailored cognitive behavioral therapy assists with stress-eating, food anxiety, and cultivating a peaceful, positive mind-body dynamic.",
    bullets: [
      "CBT-E Behavioral Coaching",
      "Stress & Emotional Eating Therapy",
      "Body Image Reconciliation",
    ],
  },
  {
    icon: BowlFood,
    name: "Nutritional Counseling",
    description:
      "Nutritional guidelines focusing on abundance, health, and satisfaction instead of restrictions. Learn intuitive and mindful eating techniques to feed your body with confidence and joy.",
    bullets: [
      "Non-Restrictive Meal Guidance",
      "Intuitive Hunger Tuning",
      "Nourishing Pantry Frameworks",
    ],
  },
  {
    icon: Sparkle,
    name: "General Consultation",
    description:
      "Not sure where to begin? A relaxed, no-pressure conversation to talk through your goals, ask questions, and find the right path for your wellness journey.",
    bullets: [
      "Goals & History Review",
      "Personalized Recommendations",
      "No-Pressure Q&A",
    ],
  },
];
