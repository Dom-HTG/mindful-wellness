import { ArrowRight, Heart, Stethoscope } from "@phosphor-icons/react";
import { useApp } from "../context/AppProvider";
import { Credentials } from "../components/Credentials";
import { CtaBanner } from "../components/CtaBanner";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { Reveal } from "../components/ui/Reveal";
import { AnimatedNumber } from "../components/ui/AnimatedNumber";

const STATS = [
  { value: 15, suffix: "+", label: "Years in practice" },
  { value: 2400, suffix: "+", label: "Clients guided" },
  { value: 98, suffix: "%", label: "Would recommend" },
  { value: 4, suffix: "", label: "Pillars of care" },
];

const BELIEFS = [
  {
    title: "Compassion before compliance",
    body: "We treat people, not numbers. Care begins with being heard.",
  },
  {
    title: "Evidence, always",
    body: "Every recommendation is grounded in clinical research and reviewed over time.",
  },
  {
    title: "The mind leads the body",
    body: "Behavioral and psychiatric care come first — nutrition and medicine follow.",
  },
  {
    title: "Care that respects your life",
    body: "Plans are built around your schedule, culture, and body, never the other way round.",
  },
];

const PROCESS = [
  {
    step: "01",
    title: "First conversation",
    body: "A free 15-minute call to understand your goals and whether we're the right fit.",
  },
  {
    step: "02",
    title: "Clinical assessment",
    body: "A thorough psychiatric, behavioral, and metabolic review of where you are today.",
  },
  {
    step: "03",
    title: "Your plan",
    body: "A personalized, non-restrictive blueprint across the pillars that fit your needs.",
  },
  {
    step: "04",
    title: "Ongoing care",
    body: "Regular one-to-one check-ins, with adjustments as your body and life change.",
  },
];

export function AboutPage() {
  const { openBooking } = useApp();

  return (
    <>
      <section className="relative overflow-hidden pt-16 pb-14 md:pt-24 md:pb-20">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-moss/10 blur-3xl" />
        <Container className="relative max-w-3xl text-center">
          <Reveal className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss dark:text-amber">
              About the Practice
            </p>
            <h1 className="font-display text-4xl font-semibold leading-[1.08] text-ink md:text-5xl lg:text-6xl dark:text-bone text-balance">
              Calm hands. Clear eyes. Careful care.
            </h1>
            <p className="mx-auto max-w-xl text-lg leading-relaxed text-ink/70 dark:text-bone/70">
              A nurse-led practice built on the belief that lasting weight
              wellness begins with the mind — and that no one should have to
              earn compassion.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 pt-1 sm:flex-row">
              <Button onClick={() => openBooking()} iconRight={<Heart size={18} weight="fill" />}>
                Book a Free Consultation
              </Button>
              <Button variant="secondary" to="/services">
                See Our Services
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="border-y border-moss/10 bg-forest py-12 text-bone dark:border-bone/10">
        <Container className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((stat) => (
            <Reveal key={stat.label} className="text-center">
              <p className="font-display text-4xl font-semibold text-amber md:text-5xl">
                <AnimatedNumber value={stat.value} />
                {stat.suffix}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-bone/60">
                {stat.label}
              </p>
            </Reveal>
          ))}
        </Container>
      </section>

      <section className="py-20 md:py-28">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss dark:text-amber">
                Our Story
              </p>
              <h2 className="mt-4 font-display text-3xl font-semibold leading-[1.12] text-ink md:text-4xl dark:text-bone text-balance">
                A practice that started with a simple question
              </h2>
              <p className="mt-5 font-display text-xl italic leading-relaxed text-ink/70 dark:text-bone/70">
                &ldquo;What if weight care started with how you feel, not how
                much you weigh?&rdquo;
              </p>
            </Reveal>
            <Reveal className="lg:col-span-7" delay={0.1}>
              <p className="text-lg leading-relaxed text-ink/80 first-letter:float-left first-letter:mt-1 first-letter:mr-3 first-letter:font-display first-letter:text-6xl first-letter:leading-[0.7] first-letter:text-moss dark:text-bone/80 dark:first-letter:text-amber">
                Mindful Wellness Clinic was founded by a psychiatric nurse
                practitioner who had watched too many people cycle through
                restrictive diets, lose weight, and lose their peace of mind
                along with it. The clinical answer, she believed, was to treat
                the person — the neurobiology, the habits, the stress, the
                sleep — not just the number on a scale.
              </p>
              <p className="mt-5 leading-relaxed text-ink/70 dark:text-bone/70">
                Today the practice brings together psychiatric and behavioral
                care, safe medical management, and non-restrictive nutrition
                under one roof. Every client receives attentive one-to-one
                guidance that respects their body, their culture, and the life
                they actually live.
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="border-y border-moss/10 bg-moss-light/40 py-20 dark:border-bone/10 dark:bg-forest/40 md:py-28">
        <Container>
          <Reveal className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss dark:text-amber">
              What We Believe
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold leading-[1.12] text-ink md:text-4xl dark:text-bone text-balance">
              Four beliefs the practice is built on
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
            {BELIEFS.map((belief, i) => (
              <Reveal key={belief.title} delay={i * 0.07}>
                <div className="flex gap-5 border-t border-moss/20 pt-6 dark:border-bone/15">
                  <span className="font-display text-2xl font-semibold text-amber">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-ink dark:text-bone">
                      {belief.title}
                    </h3>
                    <p className="mt-2 leading-relaxed text-ink/70 dark:text-bone/70">
                      {belief.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <Credentials />

      <section className="py-20 md:py-28">
        <Container>
          <Reveal className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss dark:text-amber">
              How We Work
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold leading-[1.12] text-ink md:text-4xl dark:text-bone text-balance">
              Four movements, from first call to lasting change
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-moss/15 bg-moss/15 dark:border-bone/10 dark:bg-bone/10 md:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((item) => (
              <div key={item.step} className="bg-bone p-7 dark:bg-forest-deep">
                <span className="font-display text-3xl font-semibold text-amber">
                  {item.step}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink dark:text-bone">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70 dark:text-bone/70">
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          <Reveal className="mt-12 flex flex-col items-center gap-3 rounded-2xl border border-moss/15 bg-moss-light/40 p-8 text-center dark:border-bone/10 dark:bg-forest/40 sm:flex-row sm:justify-between sm:text-left">
            <div className="flex items-center gap-3">
              <Stethoscope size={22} className="text-moss dark:text-amber" />
              <p className="font-display text-lg font-semibold text-ink dark:text-bone">
                Ready to meet your clinician?
              </p>
            </div>
            <Button onClick={() => openBooking()} iconRight={<ArrowRight size={16} />}>
              Book a Free Consultation
            </Button>
          </Reveal>
        </Container>
      </section>

      <CtaBanner />
    </>
  );
}
