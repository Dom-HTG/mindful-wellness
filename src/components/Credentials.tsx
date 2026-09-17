import { Check, Stethoscope } from "@phosphor-icons/react";
import { CREDENTIALS, CLINICIAN_HIGHLIGHTS } from "../data/credentials";
import { Container } from "./ui/Container";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";

const STATS = [
  { value: "15+", label: "Years Experience" },
  { value: "100%", label: "Holistic Model" },
  { value: "1-on-1", label: "Nurse-Led Care" },
];

export function Credentials() {
  return (
    <section
      id="credentials"
      className="border-y border-moss/10 bg-moss-light/40 py-20 dark:border-bone/10 dark:bg-forest/40 md:py-28"
    >
      <Container>
        <SectionHeading
          eyebrow="About the Practice"
          title="A credentialed, compassionate foundation"
          description="True weight wellness isn't just about nutrition; it's psychiatric, behavioral, and deeply personal."
        />

        <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-moss/15 bg-moss/15 dark:border-bone/10 dark:bg-bone/10 sm:grid-cols-3">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="bg-bone px-8 py-8 text-center dark:bg-forest-deep"
            >
              <Reveal delay={i * 0.08}>
                <p className="font-display text-4xl font-semibold text-moss dark:text-amber">
                  {stat.value}
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink/60 dark:text-bone/60">
                  {stat.label}
                </p>
              </Reveal>
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {CREDENTIALS.map((cred, i) => {
            const Icon = cred.icon;
            return (
              <Reveal key={cred.title} delay={i * 0.07}>
                <div className="flex h-full flex-col rounded-2xl border border-moss/10 bg-bone p-7 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-bone/10 dark:bg-forest-deep/60">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-moss-light text-moss dark:bg-moss/15 dark:text-amber">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-ink dark:text-bone">
                    {cred.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/70 dark:text-bone/70">
                    {cred.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-16">
          <div className="grid grid-cols-1 items-center gap-10 rounded-2xl border border-moss/15 bg-bone p-8 shadow-sm dark:border-bone/10 dark:bg-forest-deep/60 md:p-12 lg:grid-cols-12">
            <div className="flex justify-center lg:col-span-4">
              <div className="relative flex items-end justify-center">
                <div className="absolute bottom-0 h-52 w-52 rounded-full bg-gradient-to-tr from-moss-light via-moss/20 to-moss/30 md:h-60 md:w-60" />
                <div className="relative z-10 h-56 w-52 overflow-hidden rounded-2xl border-4 border-moss/15 shadow-lg md:h-64 md:w-60">
                  <img
                    src="/primary_nurse.jpg"
                    alt="Lead psychiatric nurse practitioner"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <div className="absolute right-0 bottom-0 z-20 flex h-11 w-11 items-center justify-center rounded-xl bg-moss text-bone-50 shadow-md">
                  <Stethoscope size={22} />
                </div>
              </div>
            </div>

            <div className="space-y-5 lg:col-span-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss dark:text-amber">
                Meet Your Lead Clinician
              </p>
              <h3 className="font-display text-2xl font-semibold text-ink md:text-3xl dark:text-bone">
                Nurse-led weight &amp; mental wellness care
              </h3>
              <p className="max-w-2xl font-display text-xl italic leading-relaxed text-ink/80 md:text-2xl dark:text-bone/80">
                &ldquo;My practice is founded on replacing cold, clinical
                isolation and shame-based dieting with warm, personalized
                psychiatric nursing care. Every client receives attentive
                1-on-1 guidance that respects their body, neurobiology, and
                personal life journey.&rdquo;
              </p>
              <div className="flex flex-wrap gap-2.5">
                {CLINICIAN_HIGHLIGHTS.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-full border border-moss/15 bg-moss-light px-3.5 py-1.5 text-xs font-medium text-ink/80 dark:border-bone/10 dark:bg-bone/5 dark:text-bone/80"
                  >
                    <Check size={14} className="text-moss dark:text-amber" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
