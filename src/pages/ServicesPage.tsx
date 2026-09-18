import { Check, ArrowRight, Sparkle, Heart } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { Brain, Pulse, BowlFood } from "@phosphor-icons/react";
import { useApp } from "../context/AppProvider";
import { CtaBanner } from "../components/CtaBanner";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { Reveal } from "../components/ui/Reveal";
import { cn } from "../lib/utils";

interface ServiceDetail {
  icon: Icon;
  name: string;
  tagline: string;
  overview: string;
  included: string[];
  whoFor: string;
}

const DETAILS: ServiceDetail[] = [
  {
    icon: Brain,
    name: "Psychological Counseling",
    tagline: "Start with the mind",
    overview:
      "Understand the core drivers of your eating habits. Our tailored cognitive behavioral therapy assists with stress-eating, food anxiety, and cultivating a peaceful, positive mind-body dynamic.",
    included: [
      "CBT-E behavioral coaching",
      "Stress & emotional eating therapy",
      "Body image reconciliation",
      "Weekly or biweekly 1-on-1 sessions",
    ],
    whoFor:
      "Anyone whose eating is tangled with stress, anxiety, mood, or body image.",
  },
  {
    icon: Pulse,
    name: "Medical Management",
    tagline: "Clinical oversight, safely",
    overview:
      "Safe, professional clinical tracking targeting the physiological mechanisms of your body. We provide metabolic evaluations, health screenings, and professional guidance on biological health.",
    included: [
      "Metabolic health assessments",
      "Hormonal & lab diagnostics",
      "Safe medical progression tracking",
      "Medication review where appropriate",
    ],
    whoFor:
      "Clients who want clinical oversight, labs, and safe medical support.",
  },
  {
    icon: BowlFood,
    name: "Nutritional Counseling",
    tagline: "Food without fear",
    overview:
      "Nutritional guidelines focusing on abundance, health, and satisfaction instead of restrictions. Learn intuitive and mindful eating techniques to feed your body with confidence and joy.",
    included: [
      "Non-restrictive meal guidance",
      "Intuitive hunger tuning",
      "Nourishing pantry frameworks",
      "Flexible, culture-aware planning",
    ],
    whoFor:
      "People ready to rebuild a peaceful, flexible relationship with food.",
  },
];

const COMPARISON: { focus: string; values: [boolean, boolean, boolean] }[] = [
  { focus: "Behavioral therapy", values: [true, false, false] },
  { focus: "Lab & metabolic testing", values: [false, true, false] },
  { focus: "Medication review", values: [false, true, false] },
  { focus: "Meal & pantry frameworks", values: [false, false, true] },
  { focus: "One-to-one coaching", values: [true, true, true] },
];

export function ServicesPage() {
  const { openBooking, openChat } = useApp();

  return (
    <>
      <section className="relative overflow-hidden pt-16 pb-14 md:pt-24 md:pb-20">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-amber/10 blur-3xl" />
        <Container className="relative max-w-3xl text-center">
          <Reveal className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss dark:text-amber">
              What We Do
            </p>
            <h1 className="font-display text-4xl font-semibold leading-[1.08] text-ink md:text-5xl lg:text-6xl dark:text-bone text-balance">
              Personalized, science-backed care.
            </h1>
            <p className="mx-auto max-w-xl text-lg leading-relaxed text-ink/70 dark:text-bone/70">
              Three pillars, one journey. We combine psychological care,
              clinical knowledge, and functional nutrition into a single,
              cohesive plan.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 pt-1 sm:flex-row">
              <Button onClick={() => openBooking()} iconRight={<Heart size={18} weight="fill" />}>
                Book a Free Consultation
              </Button>
              <Button variant="secondary" onClick={openChat}>
                Ask the Assistant
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="pb-8">
        <Container className="space-y-16 md:space-y-24">
          {DETAILS.map((service, i) => {
            const Icon = service.icon;
            const reversed = i % 2 === 1;
            return (
              <Reveal key={service.name}>
                <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
                  <div
                    className={cn(
                      "lg:col-span-6",
                      reversed && "lg:order-2",
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-moss-light text-moss dark:bg-moss/15 dark:text-amber">
                        <Icon size={28} />
                      </span>
                      <span className="font-display text-3xl font-semibold text-amber">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-moss dark:text-amber">
                      {service.tagline}
                    </p>
                    <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.12] text-ink md:text-4xl dark:text-bone text-balance">
                      {service.name}
                    </h2>
                    <p className="mt-4 max-w-lg leading-relaxed text-ink/70 dark:text-bone/70">
                      {service.overview}
                    </p>
                    <div className="mt-6">
                      <Button onClick={() => openBooking(service.name)} iconRight={<ArrowRight size={16} />}>
                        Book {service.name}
                      </Button>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "lg:col-span-6",
                      reversed && "lg:order-1",
                    )}
                  >
                    <div className="rounded-2xl border border-moss/15 bg-bone p-7 shadow-sm dark:border-bone/10 dark:bg-forest-deep/60">
                      <h3 className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.14em] text-moss dark:text-amber">
                        <Sparkle size={16} weight="fill" />
                        What&rsquo;s included
                      </h3>
                      <ul className="mt-5 space-y-3">
                        {service.included.map((item) => (
                          <li key={item} className="flex items-start gap-3 text-sm">
                            <Check size={16} className="mt-0.5 shrink-0 text-amber" />
                            <span className="text-ink/80 dark:text-bone/80">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6 border-t border-moss/15 pt-5 dark:border-bone/10">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss dark:text-amber">
                          Who it&rsquo;s for
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-ink/70 dark:text-bone/70">
                          {service.whoFor}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </Container>
      </section>

      <section className="border-y border-moss/10 bg-moss-light/40 py-20 dark:border-bone/10 dark:bg-forest/40 md:py-28">
        <Container className="max-w-4xl">
          <Reveal className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss dark:text-amber">
              At a Glance
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold leading-[1.12] text-ink md:text-4xl dark:text-bone text-balance">
              Where each pillar focuses
            </h2>
          </Reveal>

          <Reveal className="mt-12 overflow-hidden rounded-2xl border border-moss/15 bg-bone dark:border-bone/10 dark:bg-forest-deep/60">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-moss/15 dark:border-bone/10">
                  <th className="px-5 py-4 font-display font-semibold text-ink dark:text-bone">
                    Focus
                  </th>
                  {DETAILS.map((s) => (
                    <th
                      key={s.name}
                      className="px-3 py-4 text-center font-medium text-ink/70 dark:text-bone/70"
                    >
                      <span className="hidden md:inline">{s.name}</span>
                      <span className="md:hidden">{s.name.split(" ")[0]}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr
                    key={row.focus}
                    className="border-b border-moss/10 last:border-0 dark:border-bone/10"
                  >
                    <td className="px-5 py-4 text-ink/80 dark:text-bone/80">
                      {row.focus}
                    </td>
                    {row.values.map((has, idx) => (
                      <td key={idx} className="px-3 py-4 text-center">
                        {has ? (
                          <Check
                            size={18}
                            className="mx-auto text-amber"
                            aria-label="Included"
                          />
                        ) : (
                          <span
                            className="mx-auto block h-px w-4 bg-moss/30"
                            aria-label="Not included"
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </Reveal>

          <Reveal className="mt-10 text-center">
            <Button variant="secondary" onClick={openChat}>
              Not sure which one? Ask the assistant
            </Button>
          </Reveal>
        </Container>
      </section>

      <CtaBanner />
    </>
  );
}
