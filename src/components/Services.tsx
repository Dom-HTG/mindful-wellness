import { Check } from "@phosphor-icons/react";
import { SERVICES } from "../data/services";
import { useApp } from "../context/AppProvider";
import { Container } from "./ui/Container";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import { Button } from "./ui/Button";
import { cn } from "../lib/utils";

export function Services() {
  const { openBooking } = useApp();

  return (
    <section id="services" className="py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Our Pillars of Support"
          title="Personalized, science-backed offerings"
          description="We don't offer generic templates. We combine psychological care, clinical knowledge, and functional nutrition into one cohesive journey."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {SERVICES.map((service, i) => {
            const Icon = service.icon;
            const featured = Boolean(service.featured);
            return (
              <Reveal key={service.name} delay={i * 0.08} className="h-full">
                <div
                  className={cn(
                    "relative flex h-full flex-col rounded-2xl p-8",
                    featured
                      ? "bg-forest text-bone shadow-lg dark:bg-moss-dark"
                      : "border border-moss/15 bg-bone shadow-sm dark:border-bone/10 dark:bg-forest-deep/60",
                  )}
                >
                  {featured ? (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-amber px-4 py-1 text-xs font-semibold uppercase tracking-wider text-bone-50">
                      Clinical Standard
                    </span>
                  ) : null}

                  <div
                    className={cn(
                      "mb-7 flex h-12 w-12 items-center justify-center rounded-xl",
                      featured
                        ? "bg-bone/10 text-amber"
                        : "bg-moss-light text-moss dark:bg-moss/15 dark:text-amber",
                    )}
                  >
                    <Icon size={24} />
                  </div>

                  <h3 className="text-xl font-semibold">{service.name}</h3>
                  <p
                    className={cn(
                      "mt-3 flex-1 text-sm leading-relaxed",
                      featured ? "text-bone/80" : "text-ink/70 dark:text-bone/70",
                    )}
                  >
                    {service.description}
                  </p>

                  <ul className="mt-6 space-y-3">
                    {service.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-center gap-2.5 text-sm font-medium"
                      >
                        <Check
                          size={16}
                          className={cn(
                            "shrink-0",
                            featured ? "text-amber" : "text-moss dark:text-amber",
                          )}
                        />
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <Button
                      fullWidth
                      variant={featured ? "primary" : "secondary"}
                      onClick={() => openBooking(service.name)}
                    >
                      Learn More &amp; Book
                    </Button>
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
