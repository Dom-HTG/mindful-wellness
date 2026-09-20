import { useApp } from "../context/AppProvider";
import { Container } from "./ui/Container";
import { Button } from "./ui/Button";
import { Reveal } from "./ui/Reveal";

export function CtaBanner() {
  const { openBooking } = useApp();

  return (
    <section className="relative overflow-hidden bg-forest py-20 text-bone md:py-28 dark:bg-moss-dark">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(ellipse_at_center,_var(--color-moss)_0%,_transparent_70%)]" />
      <Container className="relative z-10 max-w-4xl">
        <Reveal className="space-y-6 text-center">
          <h2 className="font-display text-3xl font-semibold leading-[1.15] md:text-4xl lg:text-5xl text-balance">
            Ready to begin your transformation?
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-bone/80">
            Take the first step with a complimentary, no-obligation 15-minute
            consultation. We&rsquo;ll outline a strategy and explore how we can
            support you.
          </p>
          <Button size="lg" onClick={() => openBooking()}>
            Book a Free Consultation
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
