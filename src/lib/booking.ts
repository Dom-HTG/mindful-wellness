import { CLINIC_CONFIG } from "./config";

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  timeSlot: string;
  notes: string;
  concerns: string[];
  conditions: string[];
  duration: string;
  symptoms: string;
}

export function buildBookingPayload(data: BookingFormData): string {
  const concernsStr =
    data.concerns.length > 0 ? data.concerns.join("; ") : "General Weight Management";
  const conditionsStr =
    data.conditions.length > 0 ? data.conditions.join("; ") : "None reported";
  const durationVal = data.duration || "< 6 Months";

  return [
    "==================================================",
    "MINDFUL WELLNESS AND BEHAVIOURAL HEALTH — CLINICAL INTAKE SURVEY",
    "==================================================",
    "",
    "[PATIENT CONTACT INFORMATION]",
    `• Full Name: ${data.name}`,
    `• Email Address: ${data.email}`,
    `• Phone Number: ${data.phone}`,
    "",
    "[APPOINTMENT & SERVICE PREFERENCE]",
    `• Requested Service: ${data.service}`,
    `• Preferred Date: ${data.date}`,
    `• Time Window: ${data.timeSlot}`,
    `• Additional Notes: ${data.notes || "None"}`,
    "",
    "[HEALTH SCREENING SURVEY RESPONSES]",
    `• Primary Health Concerns: ${concernsStr}`,
    `• Diagnosed Conditions: ${conditionsStr}`,
    `• Symptom Duration: ${durationVal}`,
    `• Specific Symptoms / Current Medications: ${data.symptoms || "None listed"}`,
    "",
    "==================================================",
    `Submitted on: ${new Date().toLocaleString()}`,
    "Source: Direct Patient Link Intake Portal",
    "==================================================",
  ].join("\n");
}

export function getBookingBaseUrl(): string {
  const { protocol, hostname, host, pathname, port } = window.location;

  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "" ||
    protocol === "file:"
  ) {
    return CLINIC_CONFIG.productionUrl.replace(/\/$/, "");
  }

  const portPart = port ? `:${port}` : "";
  const base = `${protocol}//${host}${portPart}${pathname}`;
  return base.replace(/\/$/, "");
}

export function buildBookingUrl(service = ""): string {
  const base = getBookingBaseUrl();
  if (service) {
    return `${base}?service=${encodeURIComponent(service)}#book`;
  }
  return `${base}#book`;
}

export function buildMailtoUrl(payload: string): string {
  const subject = encodeURIComponent(
    "Mindful Wellness Health Intake Survey - Patient Booking",
  );
  const body = encodeURIComponent(payload);
  return `mailto:${CLINIC_CONFIG.email}?subject=${subject}&body=${body}`;
}
