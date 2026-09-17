import type { Icon } from "@phosphor-icons/react";
import { Brain, Pulse, BowlFood } from "@phosphor-icons/react";

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
    icon: Pulse,
    name: "Medical Management",
    description:
      "Safe, professional clinical tracking targeting the physiological mechanisms of your body. We provide metabolic evaluations, health screenings, and professional guidance on biological health.",
    bullets: [
      "Metabolic Health Assessments",
      "Hormonal & Lab Diagnostics",
      "Safe Medical Progression Tracking",
    ],
    featured: true,
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
];
