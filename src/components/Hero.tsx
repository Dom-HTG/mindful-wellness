import { motion, useReducedMotion } from "motion/react";
import { Heart, ArrowRight } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppProvider";
import { Button } from "./ui/Button";
import { HeroVisual } from "./HeroVisual";

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
    <section id="top" className="relative overflow-hidden pt-14 pb-16 md:pt-20 md:pb-24">
      <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-moss/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-amber/10 blur-3xl" />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-6 md:px-8 lg:grid-cols-12 lg:gap-10">
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
            className="font-display text-4xl font-semibold leading-[1.08] text-ink md:text-5xl lg:text-6xl dark:text-bone text-balance"
          >
            A calmer path to lasting weight wellness.
          </motion.h1>

          <motion.p
            {...fadeUp(0.2)}
            className="max-w-xl text-base leading-relaxed text-ink/70 md:text-lg dark:text-bone/70"
          >
            Compassionate psychiatric care and clinical coaching — no crash
            diets — to help you rebuild a sustainable relationship with your
            body.
          </motion.p>

          <motion.div
            {...fadeUp(0.3)}
            className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center"
          >
            <Button
              size="lg"
              onClick={() => openBooking()}
              iconRight={<Heart size={20} weight="fill" />}
            >
              Book a Free Consultation
            </Button>
            <Button
              size="lg"
              variant="secondary"
              to="/services"
            >
              Explore the Approach
            </Button>
          </motion.div>

          <motion.div {...fadeUp(0.4)} className="pt-1">
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-moss underline-offset-4 transition-colors hover:underline dark:text-amber"
            >
              Meet the clinician behind the practice
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>

        <div className="lg:col-span-6">
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-3xl border border-moss/15 bg-gradient-to-br from-moss-light/70 via-bone to-amber-light/60 dark:border-bone/10 dark:from-forest/60 dark:via-forest-deep dark:to-forest/60"
          >
            <HeroVisual />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-5 pb-4 text-[11px] font-medium tracking-wide text-ink/55 dark:text-bone/55">
              <span>Nurse-led care</span>
              <span className="hidden sm:inline">Drag your cursor to explore</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
