import { cn } from "../../lib/utils";
import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <Reveal
      className={cn(
        "max-w-2xl space-y-4",
        centered && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss dark:text-amber">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-semibold leading-[1.12] text-ink md:text-4xl dark:text-bone text-balance">
        {title}
      </h2>
      <div
        className={cn(
          "h-1 w-12 rounded-full bg-amber",
          centered && "mx-auto",
        )}
      />
      {description ? (
        <p className="text-base leading-relaxed text-ink/70 dark:text-bone/70 text-pretty">
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
