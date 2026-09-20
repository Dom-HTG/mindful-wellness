import type { Icon } from "@phosphor-icons/react";
import {
  Medal,
  GraduationCap,
  Brain,
  HandHeart,
} from "@phosphor-icons/react";

export interface Credential {
  icon: Icon;
  title: string;
  description: string;
}

export const CREDENTIALS: Credential[] = [
  {
    icon: Medal,
    title: "15+ Years Experience",
    description:
      "Over a decade of dedicated medical, behavioral, and emotional weight management coaching tailored to complex personal health paths.",
  },
  {
    icon: GraduationCap,
    title: "Master's in Psychiatric Nursing",
    description:
      "Board-certified Psychiatric-Mental Health Nurse Practitioner credentials bridging physical wellness with emotional support.",
  },
  {
    icon: Brain,
    title: "Cognitive Behavioral Approach",
    description:
      "Focusing on the neurological triggers behind eating habits rather than relying on unsustainable, stressful sheer willpower.",
  },
  {
    icon: HandHeart,
    title: "Holistic Care Model",
    description:
      "A comprehensive blueprint integrating psychiatric guidance, behavioral counseling, safe biological tracking, and meal therapy.",
  },
];

export const CLINICIAN_HIGHLIGHTS = [
  "Board-Certified Nurse Practitioner",
  "15+ Years Clinical Expertise",
  "Personalized 1-on-1 Strategy",
];
