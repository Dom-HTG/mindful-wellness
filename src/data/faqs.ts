export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQS: FaqItem[] = [
  {
    question: "What makes a behavioral weight management approach different?",
    answer:
      "Traditional diets rely entirely on restrictive structures and sheer willpower, which often leads to mental exhaustion and weight rebounds. Our behavioral health model tackles the cognitive triggers, neurobiological pathways, stress-eating habits, and hormone regulations that govern weight, allowing you to develop a permanent, peaceful relationship with food.",
  },
  {
    question: "Do you accept commercial medical insurance?",
    answer:
      "We act as an out-of-network provider to maintain complete control over clinical quality without insurance constraints. We provide complete, itemized superbills which you can submit directly to insurance providers for reimbursement. Additionally, we welcome payments via HSA (Health Savings Account) and FSA (Flexible Spending Account) cards.",
  },
  {
    question: "Do you prescribe clinical weight loss medications?",
    answer:
      "As a fully credentialed psychiatric and clinical practice, medical treatments are evaluated on a strict case-by-case basis. If medication is deemed appropriate, safe, and medically beneficial to support your clinical goals, our practitioners can prescribe and manage them alongside regular metabolic screenings and physical assessments.",
  },
  {
    question: "Are sessions offered virtually, in-person, or hybrid?",
    answer:
      "We provide flexible telehealth visits across the region, allowing for consistent support from the comfort of your home. Initial diagnostic reviews can be conducted in-office or virtually depending on medical monitoring requirements. Our digital portal makes sharing logs, scheduling sessions, and messaging your provider smooth and simple.",
  },
];
