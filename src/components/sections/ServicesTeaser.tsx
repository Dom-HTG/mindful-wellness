import { ArrowRight, Check } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { SERVICES } from "../../data/services";
import { useApp } from "../../context/AppProvider";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";

export function ServicesTeaser() {
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
                  className={
                    featured
                      ? "relative flex h-full flex-col rounded-2xl bg-forest p-8 text-bone shadow-lg dark:bg-moss-dark"
                      : "relative flex h-full flex-col rounded-2xl border border-moss/15 bg-bone p-8 shadow-sm dark:border-bone/10 dark:bg-forest-deep/60"
                  }
                >
                  <div
                    className={
                      featured
                        ? "mb-7 flex h-12 w-12 items-center justify-center rounded-xl bg-bone/10 text-amber"
                        : "mb-7 flex h-12 w-12 items-center justify-center rounded-xl bg-moss-light text-moss dark:bg-moss/15 dark:text-amber"
                    }
                  >
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-semibold">{service.name}</h3>
                  <p
                    className={
                      featured
                        ? "mt-3 flex-1 text-sm leading-relaxed text-bone/80"
                        : "mt-3 flex-1 text-sm leading-relaxed text-ink/70 dark:text-bone/70"
                    }
                  >
                    {service.description}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {service.bullets.slice(0, 2).map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-center gap-2.5 text-sm font-medium"
                      >
                        <Check
                          size={16}
                          className={
                            featured ? "shrink-0 text-amber" : "shrink-0 text-moss dark:text-amber"
                          }
                        />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => openBooking(service.name)}
                    className={
                      featured
                        ? "mt-8 w-full rounded-xl bg-amber py-3 text-sm font-semibold text-bone-50 transition-colors hover:bg-amber-dark"
                        : "mt-8 w-full rounded-xl border border-moss/40 py-3 text-sm font-semibold text-moss transition-colors hover:bg-moss hover:text-bone-50 dark:border-bone/25 dark:text-bone dark:hover:bg-moss"
                    }
                  >
                    Book this
                  </button>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-12 text-center">
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-moss underline-offset-4 transition-colors hover:underline dark:text-amber"
          >
            Explore all services in detail
            <ArrowRight size={16} />
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
