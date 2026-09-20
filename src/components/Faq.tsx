import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { FAQS } from "../data/faqs";
import { Container } from "./ui/Container";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import { cn } from "../lib/utils";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faqs" className="py-20 md:py-28">
      <Container className="max-w-3xl">
        <SectionHeading
          title="Frequently asked questions"
          description="Everything you need to know about our approach, credentials, and methodology."
        />

        <div className="mt-12 space-y-4">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={faq.question} delay={i * 0.05}>
                <div
                  className={cn(
                    "overflow-hidden rounded-2xl border transition-colors duration-300",
                    isOpen
                      ? "border-moss/30 bg-moss-light/20 dark:border-bone/20 dark:bg-bone/5"
                      : "border-moss/15 bg-bone dark:border-bone/10 dark:bg-forest-deep/60",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 p-6 text-left"
                  >
                    <span className="font-display text-base font-semibold text-ink transition-colors md:text-lg dark:text-bone">
                      {faq.question}
                    </span>
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-moss transition-transform duration-300 dark:text-amber",
                        isOpen ? "rotate-180 bg-moss/10" : "bg-moss-light dark:bg-bone/5",
                      )}
                    >
                      <CaretDown size={18} />
                    </span>
                  </button>
                  <div
                    className={cn(
                      "grid transition-all duration-300 ease-out",
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0",
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-6 text-sm leading-relaxed text-ink/70 md:text-base dark:text-bone/70">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
