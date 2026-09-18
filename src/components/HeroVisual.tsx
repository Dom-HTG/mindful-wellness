import { Suspense, lazy } from "react";
import { useReducedMotion } from "motion/react";

const HeroScene = lazy(() => import("./HeroScene"));

function supportsWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

function Fallback() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-moss-light via-bone to-amber-light" />
      <div className="absolute top-1/2 left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-moss/40 to-amber/30 blur-2xl" />
      <div className="absolute top-1/2 left-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-moss/25" />
      <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber/15" />
    </div>
  );
}

export function HeroVisual() {
  const reduce = useReducedMotion();
  if (reduce || !supportsWebGL()) return <Fallback />;

  return (
    <Suspense fallback={<Fallback />}>
      <HeroScene />
    </Suspense>
  );
}
