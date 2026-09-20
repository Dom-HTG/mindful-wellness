import { motion, AnimatePresence } from "motion/react";
import { CheckCircle } from "@phosphor-icons/react";
import { useApp } from "../context/AppProvider";

export function ToastViewport() {
  const { toasts } = useApp();

  return (
    <div className="pointer-events-none fixed top-6 right-6 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-auto flex items-center gap-2.5 rounded-xl border border-moss/20 bg-forest px-4 py-3 text-xs font-semibold text-bone shadow-xl dark:border-bone/15"
          >
            <CheckCircle size={20} className="shrink-0 text-amber" />
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
