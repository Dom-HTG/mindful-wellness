import { useReducedMotion } from "motion/react";

export function Marquee({ items }: { items: string[] }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-y border-moss/10 bg-forest px-6 py-5 text-bone dark:border-bone/10">
        {items.map((item) => (
          <span
            key={item}
            className="text-sm font-medium tracking-wide text-bone/80"
          >
            {item}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex overflow-hidden border-y border-moss/10 bg-forest py-5 text-bone dark:border-bone/10">
      {[0, 1].map((copy) => (
        <div
          key={copy}
          aria-hidden={copy === 1}
          className="flex shrink-0 animate-marquee items-center gap-8 pr-8"
        >
          {items.map((item) => (
            <span key={item} className="flex items-center gap-8 whitespace-nowrap">
              <span className="text-sm font-medium tracking-wide text-bone/80">
                {item}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-amber" />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
