import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, QrCode, Copy, DownloadSimple } from "@phosphor-icons/react";
import { QRCodeCanvas } from "qrcode.react";
import { useApp } from "../context/AppProvider";
import { buildBookingUrl } from "../lib/booking";
import { copyText } from "../lib/clipboard";

const QR_SERVICES = [
  { value: "", label: "All Offerings (General Clinical Intake)" },
  { value: "Psychological Counseling", label: "Psychiatry & Behavioral" },
  { value: "Nutritional Counseling", label: "Nutritional & Metabolic Health" },
];

export function QrModal() {
  const { qrOpen, closeQr, qrService, toast } = useApp();
  const [service, setService] = useState(qrService);
  const canvasWrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (qrOpen) setService(qrService);
  }, [qrOpen, qrService]);

  useEffect(() => {
    document.body.style.overflow = qrOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [qrOpen]);

  useEffect(() => {
    if (!qrOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeQr();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [qrOpen, closeQr]);

  const url = buildBookingUrl(service);

  const copyLink = async () => {
    const ok = await copyText(url);
    toast(ok ? "Direct Booking QR Link copied to clipboard" : "Direct Booking Link ready!");
  };

  const download = () => {
    const canvas = canvasWrap.current?.querySelector("canvas");
    if (!canvas) {
      toast("Generating QR Code PNG...");
      return;
    }
    const link = document.createElement("a");
    link.download = "mindful-wellness-intake-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast("QR Code PNG downloaded!");
  };

  return (
    <AnimatePresence>
      {qrOpen ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-forest-deep/80 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeQr();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md space-y-5 overflow-hidden rounded-2xl border border-moss/20 bg-bone p-6 text-center shadow-2xl dark:border-bone/15 dark:bg-forest-deep sm:p-7"
          >
            <button
              type="button"
              onClick={closeQr}
              aria-label="Close QR modal"
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-moss/20 bg-moss-light text-ink/70 transition-colors hover:text-ink dark:border-bone/15 dark:bg-bone/5 dark:text-bone/70"
            >
              <X size={18} />
            </button>

            <div className="space-y-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-moss/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-moss dark:text-amber">
                <QrCode size={14} />
                Direct Patient QR Intake
              </span>
              <h3 className="font-display text-xl font-semibold text-ink sm:text-2xl dark:text-bone">
                Scan to Launch Portal
              </h3>
              <p className="mx-auto max-w-xs text-xs leading-relaxed text-ink/70 dark:text-bone/70">
                Scan with your phone camera or share this link to launch the
                clinical health survey &amp; booking flow directly.
              </p>
            </div>

            <div className="space-y-1.5 rounded-2xl border border-moss/20 bg-moss-light/50 p-3 text-left dark:border-bone/15 dark:bg-bone/5">
              <label
                htmlFor="qr-service-select"
                className="block text-[11px] font-bold uppercase tracking-wider text-moss dark:text-amber"
              >
                Pre-select Clinical Specialty
              </label>
              <select
                id="qr-service-select"
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-moss/30 bg-bone p-2.5 text-xs font-semibold text-ink outline-none focus:ring-2 focus:ring-moss dark:border-bone/20 dark:bg-forest/60 dark:text-bone"
              >
                {QR_SERVICES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-moss/20 bg-white p-5">
              <div ref={canvasWrap} className="flex items-center justify-center">
                <QRCodeCanvas
                  value={url}
                  size={190}
                  fgColor="#26282d"
                  bgColor="#ffffff"
                  level="H"
                />
              </div>
              <p className="mt-3 max-w-[260px] font-mono text-[10px] break-all text-ink/50">
                {url}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={copyLink}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-moss/30 bg-moss-light py-3 text-xs font-semibold text-moss transition-colors hover:bg-moss/20 dark:border-bone/20 dark:bg-bone/5 dark:text-amber"
              >
                <Copy size={14} />
                Copy Direct Link
              </button>
              <button
                type="button"
                onClick={download}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-amber py-3 text-xs font-semibold text-bone-50 shadow-md transition-colors hover:bg-amber-dark"
              >
                <DownloadSimple size={14} />
                Download PNG
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
