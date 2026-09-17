import { motion, useReducedMotion } from "motion/react";
import { Stethoscope, Medal, Heart } from "@phosphor-icons/react";
import { useApp } from "../context/AppProvider";
import { Button } from "./ui/Button";

export function Hero() {
  const { openBooking } = useApp();
  const reduce = useReducedMotion();

  const fadeUp = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <section
      id="top"
      className="relative overflow-hidden pt-14 pb-20 md:pt-20 md:pb-28"
    >
      <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-moss/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-amber/10 blur-3xl" />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-6 md:px-8 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col items-start gap-6 lg:col-span-6 lg:gap-7">
          <motion.p
            {...fadeUp(0)}
            className="inline-flex items-center gap-2 rounded-full border border-moss/20 bg-moss-light/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-moss dark:border-bone/15 dark:bg-bone/5 dark:text-amber"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber" />
            Behavioral &amp; Psychiatric Weight Care
          </motion.p>

          <motion.h1
            {...fadeUp(0.1)}
            className="font-display text-4xl font-semibold leading-[1.1] text-ink md:text-5xl lg:text-6xl dark:text-bone text-balance"
          >
            A calmer path to lasting weight wellness.
          </motion.h1>

          <motion.p
            {...fadeUp(0.2)}
            className="max-w-xl text-lg leading-relaxed text-ink/70 dark:text-bone/70"
          >
            Compassionate psychiatric care and clinical coaching — no crash
            diets — to help you rebuild a sustainable relationship with your
            body.
          </motion.p>

          <motion.div
            {...fadeUp(0.3)}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button
              size="lg"
              onClick={() => openBooking()}
              iconRight={<Heart size={20} weight="fill" />}
            >
              Book a Free Consultation
            </Button>
            <Button size="lg" variant="secondary" href="#services">
              Explore the Approach
            </Button>
          </motion.div>
        </div>

        <div className="lg:col-span-6">
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto max-w-md"
          >
            <div className="relative flex items-end justify-center overflow-hidden rounded-t-[160px] rounded-b-[28px] bg-gradient-to-b from-moss-light via-moss/15 to-moss/30 dark:from-moss/20 dark:via-moss/10 dark:to-moss/30">
              <div className="pointer-events-none absolute top-16 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full border border-moss/20" />
              <div className="pointer-events-none absolute top-8 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full border border-moss/10" />
              <img
                src="/primary_nurse_cutout.png"
                alt="Lead psychiatric nurse practitioner"
                className="relative z-10 h-[420px] w-auto object-contain object-bottom md:h-[500px]"
              />

              <div className="absolute top-10 right-2 z-20 flex items-center gap-3 rounded-2xl border border-moss/15 bg-bone/90 p-3 shadow-lg backdrop-blur-md dark:bg-forest/90 dark:border-bone/10 md:-right-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-moss text-bone-50">
                  <Stethoscope size={20} />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-ink dark:text-bone">
                    Lead Clinician
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-moss dark:text-amber">
                    PMHNP-BC Certified
                  </p>
                </div>
              </div>

              <div className="absolute bottom-8 left-2 z-20 flex items-center gap-3 rounded-2xl border border-moss/15 bg-bone/90 p-3 shadow-lg backdrop-blur-md dark:bg-forest/90 dark:border-bone/10 md:-left-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-light text-amber-dark">
                  <Medal size={20} weight="fill" />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-ink dark:text-bone">
                    15+ Yrs Practice
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-ink/60 dark:text-bone/60">
                    Psychiatric Nursing Care
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
