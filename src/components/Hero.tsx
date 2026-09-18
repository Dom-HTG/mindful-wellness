import { motion, useReducedMotion } from "motion/react";
import { Stethoscope, Heart } from "@phosphor-icons/react";
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
          <motion.figure
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto max-w-md"
          >
            <div className="relative flex items-end justify-center overflow-hidden rounded-2xl border border-moss/20 bg-moss-light/70">
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-moss/10 to-transparent" />
              <img
                src="/primary_nurse_cutout.png"
                alt="Lead psychiatric nurse practitioner"
                className="relative z-10 h-[420px] w-auto object-contain object-bottom md:h-[520px]"
              />
            </div>
            <figcaption className="mt-4 flex items-center justify-between gap-4 border-t border-moss/15 pt-4 text-xs font-medium text-muted">
              <span className="flex items-center gap-2">
                <Stethoscope size={16} className="text-amber" />
                Lead Clinician — PMHNP-BC
              </span>
              <span>15+ Years Practice</span>
            </figcaption>
          </motion.figure>
        </div>
      </div>
    </section>
  );
}
