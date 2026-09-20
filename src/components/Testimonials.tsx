import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Quotes, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { TESTIMONIALS } from "../data/testimonials";
import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";
import { cn } from "../lib/utils";

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const total = TESTIMONIALS.length;

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, 8000);
    return () => window.clearInterval(id);
  }, [reduce, total]);

  const go = (next: number) => setIndex((next + total) % total);

  const active = TESTIMONIALS[index];

  return (
    <section
      id="testimonials"
      className="border-y border-moss/10 bg-moss-light/20 py-20 dark:border-bone/10 dark:bg-forest/40 md:py-28"
    >
      <Container className="max-w-4xl">
        <Reveal className="text-center">
          <h2 className="font-display text-3xl font-semibold text-ink dark:text-bone">
            Real stories of lasting change
          </h2>
        </Reveal>

        <Reveal className="mt-12">
          <div className="relative flex min-h-[300px] flex-col justify-between rounded-2xl border border-moss/15 bg-bone p-8 shadow-sm dark:border-bone/10 dark:bg-forest-deep/70 md:p-12">
            <div className="pointer-events-none absolute top-6 left-6 text-moss/10 dark:text-bone/10">
              <Quotes size={72} weight="fill" />
            </div>

            <div className="relative z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <p className="font-display text-xl font-medium italic leading-relaxed text-ink/90 md:text-2xl dark:text-bone/90">
                    &ldquo;{active.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-moss font-display text-lg font-semibold text-bone-50">
                      {active.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-ink dark:text-bone">
                        {active.name}
                      </p>
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink/50 dark:text-bone/50">
                        {active.detail}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="relative z-10 mt-8 flex items-center justify-between border-t border-moss/10 pt-6 dark:border-bone/10">
              <div className="flex gap-2">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Go to testimonial ${i + 1}`}
                    className={cn(
                      "h-2.5 rounded-full transition-all duration-300",
                      i === index
                        ? "w-6 bg-moss dark:bg-amber"
                        : "w-2.5 bg-moss/25 hover:bg-moss/50 dark:bg-bone/25",
                    )}
                  />
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => go(index - 1)}
                  aria-label="Previous testimonial"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-moss/30 text-moss transition-colors hover:bg-moss/10 dark:border-bone/20 dark:text-amber"
                >
                  <CaretLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => go(index + 1)}
                  aria-label="Next testimonial"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-moss/30 text-moss transition-colors hover:bg-moss/10 dark:border-bone/20 dark:text-amber"
                >
                  <CaretRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
