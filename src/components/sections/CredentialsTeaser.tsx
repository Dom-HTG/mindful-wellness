import { ArrowRight } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";
import { AnimatedNumber } from "../ui/AnimatedNumber";

const STATS = [
  { value: 15, suffix: "+", label: "Years in practice" },
  { value: 2400, suffix: "+", label: "Clients guided" },
  { value: 100, suffix: "%", label: "Nurse-led, 1-on-1" },
];

export function CredentialsTeaser() {
  return (
    <section
      id="credentials"
      className="border-b border-moss/10 bg-moss-light/40 py-20 dark:border-bone/10 dark:bg-forest/40 md:py-28"
    >
      <Container>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="space-y-5 lg:col-span-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss dark:text-amber">
              About the Practice
            </p>
            <h2 className="font-display text-3xl font-semibold leading-[1.12] text-ink md:text-4xl dark:text-bone text-balance">
              A credentialed, compassionate foundation
            </h2>
            <p className="max-w-md leading-relaxed text-ink/70 dark:text-bone/70">
              True weight wellness isn&rsquo;t only nutrition — it is
              psychiatric, behavioral, and deeply personal. We pair evidence
              with empathy, and give every client attentive one-to-one care.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-moss underline-offset-4 transition-colors hover:underline dark:text-amber"
            >
              Read our story &amp; credentials
              <ArrowRight size={16} />
            </Link>
          </Reveal>

          <Reveal className="lg:col-span-6" delay={0.1}>
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-moss/15 bg-moss/15 dark:border-bone/10 dark:bg-bone/10 sm:grid-cols-3">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-bone px-6 py-8 text-center dark:bg-forest-deep"
                >
                  <p className="font-display text-4xl font-semibold text-moss dark:text-amber">
                    <AnimatedNumber value={stat.value} />
                    {stat.suffix}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink/60 dark:text-bone/60">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
