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
    question: "How are sessions offered?",
    answer:
      "Every appointment is 100% virtual. We provide secure telehealth visits from the comfort of your home, with a digital portal for sharing logs, scheduling sessions, and messaging your provider — no office visits required.",
  },
];
