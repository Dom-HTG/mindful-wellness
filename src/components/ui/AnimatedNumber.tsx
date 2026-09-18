import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

export function AnimatedNumber({
  value,
  decimals = 0,
  duration = 1.5,
}: {
  value: number;
  decimals?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduce || !inView) {
      if (reduce) node.textContent = value.toFixed(decimals);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        node.textContent = v.toFixed(decimals);
      },
    });
    return () => controls.stop();
  }, [inView, value, decimals, duration, reduce]);

  return <span ref={ref}>0</span>;
}
