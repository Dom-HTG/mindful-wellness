import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  X,
  Envelope,
  Phone,
  CalendarBlank,
  Clock,
  Note,
  CheckCircle,
  XCircle,
  ArrowCounterClockwise,
  ThumbsUp,
  FloppyDisk,
  WarningCircle,
} from "@phosphor-icons/react";
import type { Booking, BookingStatus } from "../../../backend/admin/types";
import { updateBooking } from "../lib/adminApi";
import { formatLongDate } from "../../lib/utils";
import { StatusBadge } from "./StatusBadge";
import { Button } from "../../components/ui/Button";

function formatDateTime(iso: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const ACTIONS: {
  status: BookingStatus;
  label: string;
  icon: typeof CheckCircle;
  variant: "primary" | "secondary" | "moss" | "ghost";
}[] = [
  { status: "confirmed", label: "Confirm", icon: ThumbsUp, variant: "moss" },
  { status: "completed", label: "Mark Completed", icon: CheckCircle, variant: "primary" },
  { status: "cancelled", label: "Cancel", icon: XCircle, variant: "secondary" },
  { status: "pending", label: "Reset to Pending", icon: ArrowCounterClockwise, variant: "ghost" },
];

export function BookingDetail({
  booking,
  getToken,
  onClose,
  onUpdated,
}: {
  booking: Booking;
  getToken: () => Promise<string | null>;
  onClose: () => void;
  onUpdated: (booking: Booking) => void;
}) {
  const [notes, setNotes] = useState(booking.adminNotes);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNotes(booking.adminNotes);
    setError(null);
  }, [booking.id, booking.adminNotes]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const apply = async (patch: { status?: BookingStatus; adminNotes?: string }) => {
    setSaving(true);
    setError(null);
    try {
      const token = await getToken();
      const { booking: updated } = await updateBooking(token, booking.id, patch);
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex justify-end bg-forest-deep/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.aside
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-bone shadow-2xl dark:bg-forest-deep"
        >
          <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-moss/15 bg-bone/95 px-6 py-4 backdrop-blur dark:border-bone/10 dark:bg-forest-deep/95">
            <div>
              <StatusBadge status={booking.status} />
              <h2 className="mt-2 font-display text-xl font-semibold text-ink dark:text-bone">
                {booking.name || "Unnamed patient"}
              </h2>
              <p className="text-xs text-ink/50 dark:text-bone/50">
                Booking #{booking.id.slice(0, 8)} ·{" "}
                {formatDateTime(booking.createdAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-moss/20 text-ink/70 transition-colors hover:bg-moss-light dark:border-bone/15 dark:text-bone/70"
            >
              <X size={18} />
            </button>
          </header>

          <div className="space-y-6 px-6 py-6">
            {error ? (
              <div className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                <WarningCircle size={16} />
                {error}
              </div>
            ) : null}

            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoRow icon={Envelope} label="Email">
                <a
                  href={`mailto:${booking.email}`}
                  className="text-moss hover:underline dark:text-amber"
                >
                  {booking.email || "—"}
                </a>
              </InfoRow>
              <InfoRow icon={Phone} label="Phone">
                {booking.phone ? (
                  <a
                    href={`tel:${booking.phone}`}
                    className="text-moss hover:underline dark:text-amber"
                  >
                    {booking.phone}
                  </a>
                ) : (
                  "—"
                )}
              </InfoRow>
              <InfoRow icon={CalendarBlank} label="Preferred date">
                {booking.date ? formatLongDate(booking.date) : "—"}
              </InfoRow>
              <InfoRow icon={Clock} label="Time window">
                {booking.timeSlot || "—"}
              </InfoRow>
            </section>

            <section className="rounded-2xl border border-moss/15 bg-moss-light/30 p-4 dark:border-bone/10 dark:bg-bone/5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-moss dark:text-amber">
                Service
              </p>
              <p className="mt-1 text-sm font-semibold text-ink dark:text-bone">
                {booking.service || "—"}
              </p>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-moss dark:text-amber">
                Intake screening
              </p>
              <dl className="mt-1 space-y-1.5 text-sm text-ink/80 dark:text-bone/80">
                <Detail label="Primary concerns" value={booking.concerns.join("; ")} />
                <Detail label="Conditions" value={booking.conditions.join("; ")} />
                <Detail label="Duration" value={booking.duration} />
                <Detail label="Symptoms / meds" value={booking.symptoms} />
                <Detail label="Notes" value={booking.notes} />
                <Detail label="Source" value={booking.source} />
              </dl>
            </section>

            <section>
              <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-moss dark:text-amber">
                <Note size={14} />
                Internal admin notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add follow-up notes visible only to clinic staff…"
                className="mt-2 w-full resize-none rounded-xl border border-moss/30 bg-bone px-3.5 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-moss dark:border-bone/20 dark:bg-forest dark:text-bone"
              />
              <div className="mt-2 flex justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void apply({ adminNotes: notes })}
                  icon={<FloppyDisk size={16} />}
                >
                  {saving ? "Saving…" : "Save notes"}
                </Button>
              </div>
            </section>

            <section className="border-t border-moss/15 pt-5 dark:border-bone/10">
              <p className="text-[11px] font-bold uppercase tracking-wider text-moss dark:text-amber">
                Manage booking
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {ACTIONS.map((action) => {
                  const Icon = action.icon;
                  const active = booking.status === action.status;
                  return (
                    <Button
                      key={action.status}
                      variant={action.variant}
                      size="sm"
                      fullWidth
                      onClick={() => void apply({ status: action.status })}
                      icon={<Icon size={16} />}
                    >
                      {active ? `${action.label} ✓` : action.label}
                    </Button>
                  );
                })}
              </div>
            </section>

            {booking.statusHistory.length > 0 ? (
              <section className="border-t border-moss/15 pt-5 dark:border-bone/10">
                <p className="text-[11px] font-bold uppercase tracking-wider text-moss dark:text-amber">
                  Activity
                </p>
                <ol className="mt-3 space-y-2">
                  {[...booking.statusHistory].reverse().map((event, index) => (
                    <li
                      key={`${event.at}-${index}`}
                      className="flex items-center justify-between gap-3 text-xs text-ink/70 dark:text-bone/70"
                    >
                      <StatusBadge status={event.status} />
                      <span className="text-right">
                        {formatDateTime(event.at)}
                        <span className="block text-[10px] text-ink/40 dark:text-bone/40">
                          by {event.by}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}
          </div>
        </motion.aside>
      </motion.div>
    </AnimatePresence>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Envelope;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-moss/15 bg-bone-50 p-3 dark:border-bone/10 dark:bg-forest">
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-ink/45 dark:text-bone/45">
        <Icon size={13} className="text-moss dark:text-amber" />
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium text-ink dark:text-bone">
        {children}
      </p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
      <dt className="shrink-0 text-xs font-semibold text-ink/50 dark:text-bone/50">
        {label}:
      </dt>
      <dd className="italic">{value || "—"}</dd>
    </div>
  );
}
