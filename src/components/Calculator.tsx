import { useState } from "react";
import { Scales, Footprints, Moon, Drop } from "@phosphor-icons/react";
import { computeWellness } from "../lib/calculator";
import { Container } from "./ui/Container";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import { cn } from "../lib/utils";

interface SliderProps {
  icon: typeof Scales;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  minLabel: string;
  maxLabel: string;
  onChange: (v: number) => void;
}

function Slider({
  icon: Icon,
  label,
  value,
  min,
  max,
  step,
  unit,
  minLabel,
  maxLabel,
  onChange,
}: SliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm font-semibold text-ink dark:text-bone">
        <label className="flex items-center gap-2">
          <Icon size={20} className="text-moss dark:text-amber" />
          {label}
        </label>
        <span className="font-display text-base font-semibold text-moss dark:text-amber">
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-moss/20 accent-moss dark:bg-bone/20 dark:accent-amber"
        aria-label={label}
      />
      <div className="flex justify-between text-xs text-ink/50 dark:text-bone/50">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

export function Calculator() {
  const [weight, setWeight] = useState(160);
  const [activity, setActivity] = useState(30);
  const [sleep, setSleep] = useState(7.5);

  const result = computeWellness(weight, activity, sleep);

  const statusStyles: Record<string, string> = {
    optimal: "bg-moss/15 text-moss dark:bg-moss/20 dark:text-amber",
    moderate: "bg-amber/15 text-amber-dark dark:bg-amber/20 dark:text-amber",
    rest: "bg-red-500/15 text-red-700 dark:bg-red-500/20 dark:text-red-300",
  };

  return (
    <section id="calculator" className="py-20 md:py-28">
      <Container className="max-w-6xl">
        <SectionHeading
          title="Mindful hydration & energy baseline"
          description="Calculated gently for your body — no aggressive caloric deficits, just nourishing physical baselines."
        />

        <Reveal className="mt-14">
          <div className="grid grid-cols-1 gap-8 rounded-2xl border border-moss/15 bg-moss-light/30 p-8 shadow-sm dark:border-bone/10 dark:bg-forest/40 md:p-12 lg:grid-cols-12">
            <div className="space-y-8 lg:col-span-7">
              <Slider
                icon={Scales}
                label="Body Weight"
                value={weight}
                min={90}
                max={350}
                step={1}
                unit="lbs"
                minLabel="90 lbs"
                maxLabel="350 lbs"
                onChange={setWeight}
              />
              <Slider
                icon={Footprints}
                label="Daily Gentle Movement"
                value={activity}
                min={0}
                max={120}
                step={10}
                unit="mins"
                minLabel="Rest Day (0 mins)"
                maxLabel="Active Day (120 mins)"
                onChange={setActivity}
              />
              <Slider
                icon={Moon}
                label="Nightly Restful Sleep"
                value={sleep}
                min={4}
                max={11}
                step={0.5}
                unit="hours"
                minLabel="4 hrs"
                maxLabel="11 hrs"
                onChange={setSleep}
              />
            </div>

            <div className="space-y-5 rounded-2xl border border-moss/15 bg-bone p-6 shadow-md dark:border-bone/10 dark:bg-forest-deep/70 lg:col-span-5">
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-ink dark:text-bone">
                <Drop size={22} className="text-moss dark:text-amber" />
                Your Daily Baseline
              </h3>

              <div className="space-y-4">
                <div className="rounded-xl border border-moss/10 bg-moss-light/50 p-4 dark:border-bone/10 dark:bg-bone/5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-moss dark:text-amber">
                    Optimal Daily Water
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-display text-3xl font-semibold text-ink dark:text-bone">
                      {result.waterOz}
                    </span>
                    <span className="text-sm text-ink/60 dark:text-bone/60">
                      oz / day (~{result.waterCups} glasses)
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-moss/10 bg-moss-light/50 p-4 dark:border-bone/10 dark:bg-bone/5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-moss dark:text-amber">
                    Rest &amp; Recovery Score
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-display text-3xl font-semibold text-moss dark:text-amber">
                      {result.recoveryScore}%
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        statusStyles[result.status],
                      )}
                    >
                      {result.statusLabel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-moss/10 pt-4 text-sm text-ink/70 dark:border-bone/10 dark:text-bone/70">
                <p className="font-semibold text-ink dark:text-bone">
                  Clinical Insight
                </p>
                <p className="mt-1 leading-relaxed">{result.tip}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
