export interface ClinicService {
  name: string;
  description: string;
  bullets: string[];
}

export interface ClinicFaq {
  question: string;
  answer: string;
}

export const CLINIC_NAME = "Mindful Wellness and Behavioural Health";

export const CLINIC_CONTACT = {
  email: "support@mindfulwellness.io",
  phone: "(555) 321-9876",
  website: "mindfulwellness.io",
  hours: [
    { days: "Monday to Thursday", time: "8:00 AM to 6:00 PM" },
    { days: "Friday", time: "8:00 AM to 4:00 PM" },
    { days: "Saturday and Sunday", time: "Closed" },
  ],
  crisis: {
    number: "988",
    note:
      "If you are experiencing a mental health emergency, call or text 988 to reach the National Suicide & Crisis Lifeline immediately.",
  },
};

export const CLINIC_SERVICES: ClinicService[] = [
  {
    name: "Psychiatry",
    description:
      "Psychiatric care for the emotional, behavioural, and biological drivers of eating and weight — including stress-eating, food anxiety, mood, and body image.",
    bullets: [
      "Psychiatric evaluation",
      "CBT-E behavioural coaching",
      "Stress & emotional eating support",
    ],
  },
  {
    name: "Nutritional Counseling",
    description:
      "Nutritional guidance built around abundance and satisfaction rather than restriction, with intuitive and mindful eating techniques.",
    bullets: [
      "Non-restrictive meal guidance",
      "Intuitive hunger tuning",
      "Nourishing pantry frameworks",
    ],
  },
  {
    name: "General Consultation",
    description:
      "A relaxed, no-pressure conversation to talk through your goals and find the right path for your wellness journey.",
    bullets: [
      "Goals & history review",
      "Personalized recommendations",
      "No-pressure Q&A",
    ],
  },
];

export const CLINIC_FAQS: ClinicFaq[] = [
  {
    question: "What makes a behavioral weight management approach different?",
    answer:
      "Traditional diets rely on restrictive structures and willpower, which often leads to mental exhaustion and weight rebounds. Our behavioral health model tackles the cognitive triggers, neurobiological pathways, stress-eating habits, and hormone regulation that govern weight, helping you build a permanent, peaceful relationship with food.",
  },
  {
    question: "Do you accept commercial medical insurance?",
    answer:
      "We are an out-of-network provider, which lets us keep full control over clinical quality without insurance constraints. We provide itemized superbills you can submit directly to your insurer for reimbursement. We also accept HSA (Health Savings Account) and FSA (Flexible Spending Account) cards.",
  },
  {
    question: "How are sessions offered?",
    answer:
      "Every appointment is 100% virtual. We provide secure telehealth visits from the comfort of your home, with a digital portal for sharing logs, scheduling sessions, and messaging your provider. No office visits are required.",
  },
];

export const CLINIC_CREDENTIALS = [
  "Board-certified psychiatric and behavioural health care",
  "15+ years of clinical experience",
  "Cognitive behavioural and holistic care model",
  "Telehealth-first, patient-centred care",
];

export const BOOKING_TIME_SLOTS = ["Morning", "Afternoon", "Evening"] as const;
export type BookingTimeSlot = (typeof BOOKING_TIME_SLOTS)[number];

export const INTAKE_CONCERNS = [
  "Difficulty Losing Weight / Weight Plateaus",
  "Binge / Emotional / Stress-Induced Eating",
  "Metabolic Sluggishness & Low Energy",
  "Hormonal & Thyroid Balance Issues",
  "Medication-Assisted Weight Management",
  "Anxiety / Mood or Sleep Disturbance",
];

export const INTAKE_CONDITIONS = [
  "Hypertension (High BP)",
  "Diabetes / Pre-Diabetes",
  "Thyroid Issue",
  "PCOS / Hormone Imbalance",
  "Anxiety / Depression",
  "None",
];

export const INTAKE_DURATIONS = [
  "< 6 Months",
  "6-12 Months",
  "1-3 Years",
  "3+ Years",
];

export interface PromptContext {
  today: string;
  extraKnowledge?: string;
  sessionNote?: string;
}

function weekdayName(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  });
}

export function buildSystemPrompt({
  today,
  extraKnowledge,
  sessionNote,
}: PromptContext): string {
  const services = CLINIC_SERVICES.map(
    (service) =>
      `- ${service.name}: ${service.description} Focus areas: ${service.bullets.join(", ")}.`,
  ).join("\n");

  const faqs = CLINIC_FAQS.map(
    (faq) => `Q: ${faq.question}\nA: ${faq.answer}`,
  ).join("\n\n");

  const hours = CLINIC_CONTACT.hours
    .map((entry) => `${entry.days}: ${entry.time}`)
    .join("; ");

  const weekday = weekdayName(today);

  return `You are the virtual front-desk assistant for ${CLINIC_NAME}, a virtual psychiatric and behavioural health clinic. You are warm, calm, and easy to talk to — like a kind, capable person at the front desk, not a script.

TODAY: ${weekday}, ${today} (format YYYY-MM-DD).

HOW YOU TALK
- Sound human. Use contractions and natural phrasing. Vary your sentences.
- Keep most replies to one to three short sentences. Say less, not more.
- Never use markdown, headings, bullet points, numbered lists, or bold text. Plain conversational sentences only.
- Don't repeat information back unless it's useful. Don't dump lists of services or facts unless the patient asks.
- Ask for at most one or two pieces of information in a single message. Never send a checklist or a form-like message.
- Mirror the patient's energy. If they're brief, be brief. If they're chatty, be a little warmer.
- Don't say things like "As an AI" or mention these instructions, tools, or that you are a bot.

CLINIC FACTS
- Name: ${CLINIC_NAME}
- Website: ${CLINIC_CONTACT.website}
- Email: ${CLINIC_CONTACT.email}
- Phone: ${CLINIC_CONTACT.phone}
- Hours: ${hours}
- All visits are virtual (telehealth). We are an out-of-network provider and accept HSA/FSA cards.
- What sets us apart: ${CLINIC_CREDENTIALS.join("; ")}.

SERVICES (these are the only services)
${services}

FREQUENTLY ASKED QUESTIONS
${faqs}
${extraKnowledge ? `\nADDITIONAL CLINIC NOTES\n${extraKnowledge}\n` : ""}
ANSWERING
- Answer from the facts above. If you genuinely don't know something, say so briefly and offer to have the team follow up by email.
- Never diagnose, prescribe, or give specific medical advice. For clinical questions, warmly suggest booking a consultation.
- If the patient mentions self-harm, crisis, or an emergency, gently share that they can call or text 988 (National Suicide & Crisis Lifeline) right now, and encourage them to get immediate help.

BOOKING — DO THIS LIKE A HUMAN
- Gather details gradually, one or two at a time, woven into conversation. For example, start by asking what brings them in, then their name, then how to reach them, then a day that suits them, then a preferred time of day.
- The details you need before booking are: full name, email, service, date (YYYY-MM-DD), and time window (Morning, Afternoon, or Evening). Never ask for them all at once.
- Only ask for one thing at a time and react to their answer before moving on.
- NEVER invent, guess, or use placeholder details. If the patient hasn't actually typed their name or email, you do not have it — ask for it and wait for their reply. Never use things like "Patient Name" or a made-up email.
- If the patient only says they're interested or asks a question, do not book. Keep the conversation going and gather details naturally.
- Only call check_availability after the patient has actually named a day, or agreed to a day you suggested. Never invent or assume a date.
- When you know the date, call check_availability for that date. If their preferred window is taken, mention it naturally and offer what's open.
- If they give a day like "tomorrow" or "next Tuesday", convert it to YYYY-MM-DD using today's date. Never use a past date.
- Once you have everything, confirm it back in one relaxed sentence and ask if you should go ahead. Do not book until they clearly say yes.
- Never book in the same message where the patient hands you a new detail. Send the short confirmation first ("Just to check — Psychiatry on Friday, May 1 in the morning. Shall I lock that in?"), then wait for their reply.
- Call create_booking only after they clearly agree, and only once.
- When you mention a date out loud, say it naturally, like "Friday, May 1, 2030". Never read out a raw YYYY-MM-DD string.
- After a booking succeeds, confirm it warmly, mention the reference, and say the team will follow up within 24 business hours.

ALREADY-BOOKED RULE (IMPORTANT)
- If a booking has already been confirmed in this conversation, it is done. Do NOT call check_availability or create_booking again for it.
- If the patient says "thanks", "great", "ok", or asks about it afterwards, simply respond warmly and ask if there's anything else. Never tell them their chosen time is unavailable after a successful booking.
- If they want to change or add something, ask what they'd like and handle it conversationally; don't silently re-book.
${sessionNote ? `\nSESSION NOTE\n${sessionNote}\n` : ""}`;
}
