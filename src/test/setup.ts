import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import React from "react";

if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

vi.mock("motion/react", () => {
  const cache = new Map<string, React.ComponentType<Record<string, unknown>>>();

  const motion = new Proxy(
    {},
    {
      get: (_target, tag: string) => {
        if (!cache.has(tag)) {
          const Comp = React.forwardRef<HTMLElement, Record<string, unknown>>(
            (props, ref) => {
              const {
                initial,
                animate,
                exit,
                transition,
                whileInView,
                viewport,
                whileTap,
                whileHover,
                ...rest
              } = props as Record<string, unknown>;
              void initial;
              void animate;
              void exit;
              void transition;
              void whileInView;
              void viewport;
              void whileTap;
              void whileHover;
              return React.createElement(tag, { ...rest, ref });
            },
          );
          cache.set(tag, Comp);
        }
        return cache.get(tag)!;
      },
    },
  );

  return {
    motion,
    AnimatePresence: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    useReducedMotion: () => true,
    useScroll: () => ({ scrollY: { get: () => 0 }, scrollYProgress: { get: () => 0 } }),
    useMotionValueEvent: () => undefined,
    useTransform: () => undefined,
    useInView: () => true,
    animate: () => ({ stop: () => undefined }),
  };
});
