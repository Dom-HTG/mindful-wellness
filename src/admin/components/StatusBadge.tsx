import type { BookingStatus } from "../../../backend/admin/types";
import { cn } from "../../lib/utils";

const STATUS_META: Record<BookingStatus, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className:
      "border-amber/30 bg-amber-light text-amber-dark dark:bg-amber/15 dark:text-amber",
  },
  confirmed: {
    label: "Confirmed",
    className:
      "border-moss/30 bg-moss-light text-moss-dark dark:bg-moss/15 dark:text-bone",
  },
  completed: {
    label: "Completed",
    className:
      "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  cancelled: {
    label: "Cancelled",
    className:
      "border-red-300 bg-red-100 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: BookingStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
        meta.className,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}

export { STATUS_META };
