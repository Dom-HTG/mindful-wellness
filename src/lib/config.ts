export const CLINIC_CONFIG = {
  name: "Mindful Wellness Clinic",
  email: "support@mindfulwellness.io",
  phone: "(555) 321-9876",
  address: {
    line1: "120 Wellness Way, Suite 400",
    line2: "San Francisco, CA 94107",
  },
  hours: [
    { days: "Mon — Thu", time: "8:00 AM — 6:00 PM" },
    { days: "Friday", time: "8:00 AM — 4:00 PM" },
    { days: "Sat — Sun", time: "Closed", muted: true },
  ] as { days: string; time: string; muted?: boolean }[],
  web3formsKey: "",
  productionUrl: "https://mindfulwellness.io",
  crisisLine: {
    label: "24/7 Crisis Support",
    number: "988",
    note:
      "If you are experiencing a mental health emergency, call or text 988 to reach the National Suicide & Crisis Lifeline immediately.",
  },
} as const;
