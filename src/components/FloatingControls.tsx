import { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { CalendarBlank, ArrowUp } from "@phosphor-icons/react";
import { useApp } from "../context/AppProvider";

export function FloatingControls() {
  const { openBooking } = useApp();
  const { scrollY } = useScroll();
  const [past, setPast] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) => {
    const p = v > 350;
    setPast((prev) => (prev === p ? prev : p));
  });

  return (
    <>
      <motion.button
        type="button"
        onClick={() => openBooking()}
        initial={false}
        animate={{ opacity: past ? 1 : 0, y: past ? 0 : 16 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-xl bg-amber px-5 py-3 text-sm font-semibold text-bone-50 shadow-xl transition-colors hover:bg-amber-dark"
        style={{ pointerEvents: past ? "auto" : "none" }}
      >
        <CalendarBlank size={18} />
        Book a Free Consultation
      </motion.button>

      <motion.button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
        initial={false}
        animate={{ opacity: past ? 1 : 0, y: past ? 0 : 16 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-24 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-moss text-bone-50 shadow-lg transition-colors hover:bg-moss-dark"
        style={{ pointerEvents: past ? "auto" : "none" }}
      >
        <ArrowUp size={20} />
      </motion.button>
    </>
  );
}
