import { useEffect, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Stethoscope,
  ShieldCheck,
  PaperPlaneTilt,
  Clock,
  QrCode,
  ArrowRight,
  ArrowLeft,
  Brain,
  BowlFood,
  Sparkle,
  User,
  Envelope,
  Phone,
  CalendarBlank,
  CheckCircle,
  Copy,
  SunHorizon,
  Sun,
  MoonStars,
  type Icon,
} from "@phosphor-icons/react";
import { useApp } from "../context/AppProvider";
import { CLINIC_CONFIG } from "../lib/config";
import { cn, getTomorrowISODate, toISODate, formatLongDate } from "../lib/utils";
import {
  buildBookingPayload,
  buildMailtoUrl,
  type BookingFormData,
} from "../lib/booking";
import { copyText } from "../lib/clipboard";

const CONCERNS = [
  { value: "Difficulty Losing Weight / Weight Plateaus", label: "Difficulty Losing Weight" },
  { value: "Binge / Emotional / Stress-Induced Eating", label: "Emotional & Stress Eating" },
  { value: "Metabolic Sluggishness & Low Energy", label: "Low Energy & Fatigue" },
  { value: "Hormonal & Thyroid Balance Issues", label: "Hormone / Thyroid Concern" },
  { value: "Medication-Assisted Weight Management", label: "GLP-1 / Medication Support" },
  { value: "Anxiety / Mood or Sleep Disturbance", label: "Mood, Anxiety or Sleep" },
];

const CONDITIONS = [
  { value: "Hypertension (High BP)", label: "High BP" },
  { value: "Diabetes / Pre-Diabetes", label: "Pre-Diabetes" },
  { value: "Thyroid Issue", label: "Thyroid" },
  { value: "PCOS / Hormone Imbalance", label: "PCOS" },
  { value: "Anxiety / Depression", label: "Anxiety/Depr." },
  { value: "None", label: "None of above" },
];

const DURATIONS = [
  { value: "< 6 Months", label: "< 6 mos" },
  { value: "6-12 Months", label: "6-12 mos" },
  { value: "1-3 Years", label: "1-3 yrs" },
  { value: "3+ Years", label: "3+ yrs" },
];

const SERVICE_OPTIONS: { value: string; label: string; icon: Icon }[] = [
  { value: "Psychiatry", label: "Psychiatry", icon: Brain },
  { value: "Nutritional Counseling", label: "Mindful Nutrition", icon: BowlFood },
  { value: "General Inquiry", label: "General Consultation", icon: Sparkle },
];

const SERVICE_ALIASES: Record<string, string> = {
  "Psychological Counseling": "Psychiatry",
};

function normalizeService(value: string): string {
  return SERVICE_ALIASES[value] ?? value;
}

const TIME_SLOTS: { value: string; label: string; icon: Icon }[] = [
  { value: "Morning", label: "Morning", icon: SunHorizon },
  { value: "Afternoon", label: "Afternoon", icon: Sun },
  { value: "Evening", label: "Evening", icon: MoonStars },
];

export function BookingModal() {
  const { bookingOpen, closeBooking, bookingService, bookingNotes, openQr, toast } =
    useApp();

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const [concerns, setConcerns] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [duration, setDuration] = useState("< 6 Months");
  const [symptoms, setSymptoms] = useState("");

  const [service, setService] = useState(
    normalizeService(bookingService) || "Psychiatry",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(getTomorrowISODate());
  const [timeSlot, setTimeSlot] = useState("Morning");
  const [notes, setNotes] = useState(bookingNotes);
  const [agree, setAgree] = useState(false);

  const [payload, setPayload] = useState("");

  useEffect(() => {
    document.body.style.overflow = bookingOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [bookingOpen]);

  useEffect(() => {
    if (!bookingOpen) return;
    setStep(1);
    setSubmitted(false);
    setService(normalizeService(bookingService) || "Psychiatry");
    setNotes(bookingNotes);
    setConcerns([]);
    setConditions([]);
    setDuration("< 6 Months");
    setSymptoms("");
    setName("");
    setEmail("");
    setPhone("");
    setDate(getTomorrowISODate());
    setTimeSlot("Morning");
    setAgree(false);
    setPayload("");
  }, [bookingOpen, bookingService, bookingNotes]);

  useEffect(() => {
    if (!bookingOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeBooking();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [bookingOpen, closeBooking]);

  const toggle = (
    list: string[],
    setList: (v: string[]) => void,
    value: string,
  ) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const data: BookingFormData = {
      name,
      email,
      phone,
      service,
      date,
      timeSlot,
      notes,
      concerns,
      conditions,
      duration,
      symptoms,
    };
    const text = buildBookingPayload(data);
    setPayload(text);

    if (CLINIC_CONFIG.web3formsKey) {
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: CLINIC_CONFIG.web3formsKey,
          subject: `[Health Intake Survey] New Patient Request: ${name}`,
          from_name: `${name} (Mindful Intake)`,
          replyto: email,
          message: text,
          email,
          name,
          phone,
          service,
          health_concerns: concerns.join("; "),
          medical_conditions: conditions.join("; "),
          symptom_duration: duration,
          symptoms_notes: symptoms,
        }),
      }).catch(() => undefined);
    }

    setSubmitted(true);
    toast("Health screening survey & consultation request submitted!");
  };

  const copyDigest = async () => {
    const ok = await copyText(payload);
    toast(ok ? "Full Health Intake summary copied to clipboard" : "Summary ready!");
  };

  const progress = step === 1 ? 50 : 100;

  return (
    <AnimatePresence>
      {bookingOpen ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-forest-deep/80 p-3 backdrop-blur-md md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeBooking();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-h-[92dvh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-moss/20 bg-bone shadow-2xl dark:border-bone/15 dark:bg-forest-deep"
          >
            <button
              type="button"
              onClick={closeBooking}
              aria-label="Close booking modal"
              className="absolute top-4 right-4 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-moss/20 bg-bone/90 text-ink/70 transition-colors hover:bg-moss-light hover:text-ink dark:border-bone/15 dark:bg-forest/90 dark:text-bone/70"
            >
              <X size={20} />
            </button>

            {submitted ? (
              <SuccessView
                name={name}
                service={service}
                date={date}
                timeSlot={timeSlot}
                concerns={concerns}
                conditions={conditions}
                duration={duration}
                symptoms={symptoms}
                onCopy={copyDigest}
                onMailto={() => window.open(buildMailtoUrl(payload), "_blank")}
                onClose={closeBooking}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="hidden flex-col justify-between gap-8 bg-forest p-8 text-bone lg:col-span-4 lg:flex dark:bg-moss-dark">
                  <div className="space-y-6">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-bone/20 bg-bone/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-bone/90">
                      <Stethoscope size={14} />
                      Clinical Intake Portal
                    </span>

                    <div className="flex items-center gap-3">
                      <img
                        src="/primary_nurse.jpg"
                        alt="Lead psychiatric nurse practitioner"
                        className="h-14 w-14 rounded-2xl border-2 border-bone/20 object-cover"
                      />
                      <div className="leading-tight">
                        <p className="font-display font-semibold">
                          Lead Psychiatric NP
                        </p>
                        <p className="mt-0.5 text-xs text-bone/70">
                          Mindful Wellness and Behavioural Health
                        </p>
                      </div>
                    </div>

                    <p className="border-t border-bone/10 pt-4 text-xs leading-relaxed text-bone/80 italic">
                      &ldquo;We take the pressure off your shoulders. Every
                      survey is evaluated with complete clinical care, empathy,
                      and confidentiality.&rdquo;
                    </p>
                  </div>

                  <div className="space-y-3 border-t border-bone/10 pt-4 text-xs text-bone/80">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck size={16} className="shrink-0 text-amber" />
                      100% Confidential &amp; HIPAA Compliant
                    </div>
                    <div className="flex items-center gap-2.5">
                      <PaperPlaneTilt size={16} className="shrink-0 text-amber" />
                      Transfers Directly to Clinic Email
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock size={16} className="shrink-0 text-amber" />
                      24-Hour Clinical Review
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openQr()}
                    className="flex items-center justify-between rounded-xl border border-bone/15 bg-bone/5 p-3 text-left text-xs transition-colors hover:bg-bone/10"
                  >
                    <span className="flex items-center gap-2 font-semibold text-bone">
                      <QrCode size={16} className="text-amber" />
                      Direct QR Link Active
                    </span>
                    <span className="text-[10px] text-bone/70">Get QR Code</span>
                  </button>
                </div>

                <div className="p-6 sm:p-8 lg:col-span-8">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="rounded-md bg-moss/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-moss dark:bg-bone/10 dark:text-amber">
                          Step {step} of 2
                        </span>
                        <h3 className="mt-1.5 font-display text-xl font-semibold text-ink sm:text-2xl dark:text-bone">
                          {step === 1
                            ? "Health Screening Survey"
                            : "Schedule & Contact Details"}
                        </h3>
                      </div>
                      <span className="text-xs font-semibold text-moss dark:text-amber">
                        {progress}% Complete
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-moss-light dark:bg-bone/10">
                      <div
                        className="h-full rounded-full bg-moss transition-all duration-300 dark:bg-amber"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    {step === 1 ? (
                      <div className="space-y-5">
                        <p className="text-xs leading-relaxed text-ink/60 dark:text-bone/60">
                          Please complete this preliminary health screening so
                          our clinical team understands how best to tailor your
                          care.
                        </p>

                        <fieldset className="space-y-2">
                          <legend className="text-xs font-bold uppercase tracking-wider text-moss dark:text-amber">
                            1. Primary health concern or symptom
                          </legend>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {CONCERNS.map((c) => (
                              <CheckChip
                                key={c.value}
                                checked={concerns.includes(c.value)}
                                label={c.label}
                                onToggle={() => toggle(concerns, setConcerns, c.value)}
                              />
                            ))}
                          </div>
                        </fieldset>

                        <fieldset className="space-y-2">
                          <legend className="text-xs font-bold uppercase tracking-wider text-moss dark:text-amber">
                            2. Any diagnosed medical conditions?
                          </legend>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {CONDITIONS.map((c) => (
                              <CheckChip
                                key={c.value}
                                small
                                checked={conditions.includes(c.value)}
                                label={c.label}
                                onToggle={() =>
                                  toggle(conditions, setConditions, c.value)
                                }
                              />
                            ))}
                          </div>
                        </fieldset>

                        <fieldset className="space-y-2">
                          <legend className="text-xs font-bold uppercase tracking-wider text-moss dark:text-amber">
                            3. How long have you been experiencing this?
                          </legend>
                          <div className="grid grid-cols-4 gap-2">
                            {DURATIONS.map((d) => (
                              <label
                                key={d.value}
                                className={cn(
                                  "cursor-pointer rounded-xl border px-2 py-2 text-center text-xs font-medium transition-colors",
                                  duration === d.value
                                    ? "border-moss bg-moss text-bone-50 dark:border-amber dark:bg-amber dark:text-bone-50"
                                    : "border-moss/30 text-ink hover:border-moss dark:border-bone/20 dark:text-bone",
                                )}
                              >
                                <input
                                  type="radio"
                                  name="duration"
                                  value={d.value}
                                  checked={duration === d.value}
                                  onChange={() => setDuration(d.value)}
                                  className="sr-only"
                                />
                                {d.label}
                              </label>
                            ))}
                          </div>
                        </fieldset>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold uppercase tracking-wider text-moss dark:text-amber">
                            4. Current medications or specific symptoms
                          </label>
                          <textarea
                            rows={2}
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            placeholder="List any medications, supplements, or specific symptoms you are experiencing..."
                            className="w-full resize-none rounded-xl border border-moss/30 bg-bone px-3.5 py-2 text-sm text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-moss dark:border-bone/20 dark:bg-forest/60 dark:text-bone dark:placeholder:text-bone/40"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-moss py-3.5 text-sm font-bold text-bone-50 shadow-md transition-colors hover:bg-moss-dark"
                        >
                          Continue to Schedule Consultation
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <div className="space-y-1.5">
                          <span className="block text-xs font-bold uppercase tracking-wider text-moss dark:text-amber">
                            1. Select Service Focus
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            {SERVICE_OPTIONS.map((s) => {
                              const Icon = s.icon;
                              const active = service === s.value;
                              return (
                                <button
                                  key={s.value}
                                  type="button"
                                  onClick={() => setService(s.value)}
                                  className={cn(
                                    "flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs font-medium transition-all",
                                    active
                                      ? "border-moss bg-moss text-bone-50 shadow-sm dark:border-amber dark:bg-amber dark:text-bone-50"
                                      : "border-moss/25 text-ink hover:border-moss hover:bg-moss-light/40 dark:border-bone/20 dark:text-bone",
                                  )}
                                >
                                  <Icon size={16} className="shrink-0" />
                                  <span className="truncate">{s.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="block text-xs font-bold uppercase tracking-wider text-moss dark:text-amber">
                            2. Contact Details
                          </span>
                          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                            <Field icon={User} placeholder="Full Name" value={name} onChange={setName} type="text" autoComplete="name" />
                            <Field icon={Envelope} placeholder="Email Address" value={email} onChange={setEmail} type="email" autoComplete="email" />
                            <Field icon={Phone} placeholder="Phone Number" value={phone} onChange={setPhone} type="tel" autoComplete="tel" />
                            <div className="relative">
                              <CalendarBlank size={16} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-moss dark:text-amber" />
                              <input
                                type="date"
                                required
                                value={date}
                                min={toISODate(new Date())}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full rounded-xl border border-moss/30 bg-bone py-2.5 pr-3 pl-10 text-sm text-ink outline-none focus:ring-2 focus:ring-moss dark:border-bone/20 dark:bg-forest/60 dark:text-bone"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="block text-xs font-bold uppercase tracking-wider text-moss dark:text-amber">
                            3. Preferred Time Window
                          </span>
                          <div className="grid grid-cols-3 gap-2">
                            {TIME_SLOTS.map((t) => {
                              const Icon = t.icon;
                              const active = timeSlot === t.value;
                              return (
                                <button
                                  key={t.value}
                                  type="button"
                                  onClick={() => setTimeSlot(t.value)}
                                  className={cn(
                                    "flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all",
                                    active
                                      ? "border-moss bg-moss text-bone-50 dark:border-amber dark:bg-amber dark:text-bone-50"
                                      : "border-moss/30 text-ink hover:bg-moss-light/40 dark:border-bone/20 dark:text-bone",
                                  )}
                                >
                                  <Icon size={14} />
                                  {t.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <textarea
                          rows={1}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Additional scheduling requests or notes (optional)..."
                          className="w-full resize-none rounded-xl border border-moss/30 bg-bone px-3.5 py-2 text-sm text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-moss dark:border-bone/20 dark:bg-forest/60 dark:text-bone dark:placeholder:text-bone/40"
                        />

                        <label className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            required
                            checked={agree}
                            onChange={(e) => setAgree(e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-moss/30 accent-moss"
                          />
                          <span className="text-[11px] leading-normal text-ink/70 dark:text-bone/70">
                            I agree to be contacted for scheduling. I understand
                            this form transfers my health survey data to clinic
                            staff for inquiry purposes.
                          </span>
                        </label>

                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="flex items-center justify-center gap-1 rounded-xl border border-moss/20 bg-moss-light/60 py-3 text-xs font-semibold text-ink transition-colors hover:bg-moss-light dark:border-bone/20 dark:bg-bone/5 dark:text-bone"
                          >
                            <ArrowLeft size={14} />
                            Back to Survey
                          </button>
                          <button
                            type="submit"
                            className="flex items-center justify-center gap-2 rounded-xl bg-amber py-3 text-sm font-bold text-bone-50 shadow-lg transition-colors hover:bg-amber-dark sm:col-span-2"
                          >
                            <PaperPlaneTilt size={18} />
                            Submit &amp; Transfer to Clinic Email
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Field({
  icon: Icon,
  placeholder,
  value,
  onChange,
  type,
  autoComplete,
}: {
  icon: Icon;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  autoComplete?: string;
}) {
  return (
    <div className="relative">
      <Icon
        size={16}
        className="absolute top-1/2 left-3.5 -translate-y-1/2 text-moss dark:text-amber"
      />
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-moss/30 bg-bone py-2.5 pr-3 pl-10 text-sm text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-moss dark:border-bone/20 dark:bg-forest/60 dark:text-bone dark:placeholder:text-bone/40"
      />
    </div>
  );
}

function CheckChip({
  checked,
  label,
  onToggle,
  small,
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
  small?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-xl border transition-colors",
        small ? "p-2" : "p-2.5",
        checked
          ? "border-moss bg-moss-light/50 dark:border-amber dark:bg-bone/5"
          : "border-moss/25 hover:bg-moss-light/40 dark:border-bone/20 dark:hover:bg-bone/5",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className={cn(
          "rounded accent-moss",
          small ? "h-3.5 w-3.5" : "h-4 w-4",
        )}
      />
      <span
        className={cn(
          "text-xs font-medium text-ink dark:text-bone",
          small && "truncate",
        )}
      >
        {label}
      </span>
    </label>
  );
}

function SuccessView({
  name,
  service,
  date,
  timeSlot,
  concerns,
  conditions,
  duration,
  symptoms,
  onCopy,
  onMailto,
  onClose,
}: {
  name: string;
  service: string;
  date: string;
  timeSlot: string;
  concerns: string[];
  conditions: string[];
  duration: string;
  symptoms: string;
  onCopy: () => void;
  onMailto: () => void;
  onClose: () => void;
}) {
  const concernsStr = concerns.length > 0 ? concerns.join("; ") : "Weight Management";
  const conditionsStr = conditions.length > 0 ? conditions.join("; ") : "None";

  return (
    <div className="p-6 text-center sm:p-10">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-moss-light text-moss dark:bg-moss/15 dark:text-amber">
        <CheckCircle size={48} />
      </div>

      <div className="mx-auto mt-6 max-w-lg space-y-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-moss dark:text-amber">
          Health Screening Transferred to Email
        </span>
        <h3 className="font-display text-2xl font-semibold text-ink md:text-3xl dark:text-bone">
          Intake &amp; Consultation Received
        </h3>
        <p className="text-sm leading-relaxed text-ink/70 dark:text-bone/70">
          Thank you, <strong>{name.split(" ")[0] || "friend"}</strong>. Your
          health survey responses have been formatted and dispatched to our
          clinical team. We will review your symptoms and contact you within 24
          business hours.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-lg rounded-2xl border border-moss/20 bg-moss-light/40 p-5 text-left text-xs dark:border-bone/15 dark:bg-bone/5">
        <div className="flex items-center justify-between border-b border-moss/15 pb-2 dark:border-bone/10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-moss dark:text-amber">
            Submitted Health Intake Payload
          </span>
          <span className="rounded bg-moss/15 px-2 py-0.5 text-[10px] font-semibold text-moss dark:text-amber">
            Transferred to Email
          </span>
        </div>
        <div className="mt-2 grid grid-cols-1 gap-1.5 text-ink/90 sm:grid-cols-2 dark:text-bone/90">
          <p>
            <strong>Service:</strong> {service}
          </p>
          <p>
            <strong>Requested Date:</strong> {formatLongDate(date)} — {timeSlot}
          </p>
          <p>
            <strong>Primary Concern:</strong> {concernsStr}
          </p>
          <p>
            <strong>Conditions:</strong> {conditionsStr}
          </p>
          <p className="sm:col-span-2">
            <strong>Duration:</strong> {duration}
          </p>
          <p className="sm:col-span-2 border-t border-moss/10 pt-1.5 dark:border-bone/10">
            <strong>Symptoms / Meds:</strong>{" "}
            <span className="italic">{symptoms || "None specified"}</span>
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-moss px-6 py-2.5 text-xs font-semibold text-bone-50 shadow-md transition-colors hover:bg-moss-dark"
        >
          Return to Practice Site
        </button>
        <button
          type="button"
          onClick={onCopy}
          className="flex items-center gap-1.5 rounded-xl border border-moss/40 px-5 py-2.5 text-xs font-semibold text-ink transition-colors hover:bg-moss-light dark:border-bone/20 dark:text-bone"
        >
          <Copy size={14} className="text-moss dark:text-amber" />
          Copy Intake Digest
        </button>
        <button
          type="button"
          onClick={onMailto}
          className="flex items-center gap-1.5 rounded-xl bg-moss-light px-5 py-2.5 text-xs font-semibold text-moss transition-colors hover:bg-moss/20 dark:bg-bone/5 dark:text-amber"
        >
          <Envelope size={14} />
          Open Email Client
        </button>
      </div>
    </div>
  );
}
