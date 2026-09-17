export interface Testimonial {
  quote: string;
  name: string;
  initials: string;
  detail: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Mindful Weightful Clinic changed my entire life dynamic. For the first time ever, I felt zero guilt. I lost 35 lbs organically, but more importantly, I found absolute peace of mind.",
    name: "Sarah M.",
    initials: "SM",
    detail: "Active Client — 14 Months",
  },
  {
    quote:
      "The unique blending of psychiatric insight with non-restrictive nutrition counseling was my turning point. I finally understand the brain triggers that govern my eating behavior.",
    name: "David L.",
    initials: "DL",
    detail: "Active Client — 8 Months",
  },
  {
    quote:
      "Zero shame. No aggressive targets. Just profound clinical expertise, emotional comfort, and practical psychological tools that integrated seamlessly into my hectic schedule.",
    name: "Elena R.",
    initials: "ER",
    detail: "Active Client — 2 Years",
  },
];
