import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plant,
  SignOut,
  MagnifyingGlass,
  ArrowClockwise,
  Users,
  Clock,
  ThumbsUp,
  CheckCircle,
  XCircle,
  CaretRight,
  SpinnerGap,
  WarningCircle,
  CalendarBlank,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import type { Booking, BookingStatus } from "../../../backend/admin/types";
import { useAdminAuth } from "../AdminAuthProvider";
import {
  fetchBookings,
  type BookingStats,
} from "../lib/adminApi";
import { STATUS_META, StatusBadge } from "./StatusBadge";
import { BookingDetail } from "./BookingDetail";
import { cn } from "../../lib/utils";

type FilterStatus = BookingStatus | "all";

const FILTERS: FilterStatus[] = [
  "all",
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

function formatDateTime(iso: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AdminDashboard() {
  const { user, getToken, signOut, mode } = useAdminAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const data = await fetchBookings(token, {
        status: filter,
        q: debouncedSearch,
      });
      setBookings(data.bookings);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, [getToken, filter, debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const handleUpdated = useCallback((updated: Booking) => {
    setBookings((prev) =>
      prev.map((booking) => (booking.id === updated.id ? updated : booking)),
    );
    setSelected(updated);
    setNotice(`Booking marked as ${updated.status}.`);
  }, []);

  const statCards = useMemo(() => {
    const byStatus = stats?.byStatus;
    return [
      { key: "total", label: "Total", value: stats?.total ?? 0, icon: Users, tone: "text-moss dark:text-amber" },
      { key: "pending", label: "Pending", value: byStatus?.pending ?? 0, icon: Clock, tone: "text-amber" },
      { key: "confirmed", label: "Confirmed", value: byStatus?.confirmed ?? 0, icon: ThumbsUp, tone: "text-moss" },
      { key: "completed", label: "Completed", value: byStatus?.completed ?? 0, icon: CheckCircle, tone: "text-emerald-600" },
      { key: "cancelled", label: "Cancelled", value: byStatus?.cancelled ?? 0, icon: XCircle, tone: "text-red-600" },
    ];
  }, [stats]);

  return (
    <div className="min-h-dvh bg-bone dark:bg-forest-deep">
      <header className="sticky top-0 z-30 border-b border-moss/15 bg-bone/90 backdrop-blur-md dark:border-bone/10 dark:bg-forest-deep/90">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-moss text-bone-50">
              <Plant size={20} weight="fill" />
            </span>
            <div className="leading-tight">
              <p className="font-display text-base font-semibold text-ink dark:text-bone">
                Bookings Console
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-moss dark:text-amber">
                Mindful Wellness
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="hidden items-center gap-2 sm:flex">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt=""
                    className="h-8 w-8 rounded-full border border-moss/20 object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-moss-light text-xs font-bold text-moss-dark dark:bg-bone/10 dark:text-bone">
                    {user.email.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="max-w-[180px] truncate text-xs font-medium text-ink/70 dark:text-bone/70">
                  {user.email}
                </span>
              </div>
            ) : null}
            <Link
              to="/"
              className="hidden items-center gap-1 rounded-xl border border-moss/25 px-3 py-2 text-xs font-semibold text-ink/70 transition-colors hover:border-moss hover:text-moss sm:inline-flex dark:border-bone/20 dark:text-bone/70"
            >
              <ArrowSquareOut size={14} />
              View site
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              className="flex items-center gap-1.5 rounded-xl border border-moss/25 px-3 py-2 text-xs font-semibold text-ink/70 transition-colors hover:border-red-400 hover:text-red-600 dark:border-bone/20 dark:text-bone/70"
            >
              <SignOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {mode === "dev" ? (
          <div className="rounded-xl border border-dashed border-amber/50 bg-amber-light/40 px-4 py-2.5 text-xs text-amber-dark dark:bg-amber/10 dark:text-amber">
            Local dev mode — bookings are stored on disk at{" "}
            <code>backend/admin/.data/bookings.json</code>.
          </div>
        ) : null}

        {notice ? (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            <CheckCircle size={16} />
            {notice}
          </div>
        ) : null}

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                className="rounded-2xl border border-moss/15 bg-bone-50 p-4 dark:border-bone/10 dark:bg-forest"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ink/45 dark:text-bone/45">
                    {card.label}
                  </span>
                  <Icon size={18} className={card.tone} />
                </div>
                <p className="mt-2 font-display text-2xl font-semibold text-ink dark:text-bone">
                  {card.value}
                </p>
              </div>
            );
          })}
        </section>

        <section className="rounded-2xl border border-moss/15 bg-bone-50 dark:border-bone/10 dark:bg-forest">
          <div className="flex flex-col gap-3 border-b border-moss/15 p-4 lg:flex-row lg:items-center lg:justify-between dark:border-bone/10">
            <div className="relative w-full lg:max-w-sm">
              <MagnifyingGlass
                size={16}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-ink/40 dark:text-bone/40"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, service…"
                className="w-full rounded-xl border border-moss/25 bg-bone py-2.5 pr-3 pl-9 text-sm text-ink outline-none focus:ring-2 focus:ring-moss dark:border-bone/20 dark:bg-forest-deep dark:text-bone"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {FILTERS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    filter === value
                      ? "border-moss bg-moss text-bone-50"
                      : "border-moss/25 text-ink/60 hover:border-moss hover:text-moss dark:border-bone/20 dark:text-bone/60",
                  )}
                >
                  {value === "all" ? "All" : STATUS_META[value].label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => void load()}
                aria-label="Refresh bookings"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-moss/25 text-ink/60 transition-colors hover:border-moss hover:text-moss dark:border-bone/20 dark:text-bone/60"
              >
                <ArrowClockwise size={16} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {error ? (
            <div className="flex items-center gap-2 p-6 text-sm text-red-600 dark:text-red-300">
              <WarningCircle size={18} />
              {error}
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center gap-2 p-16 text-sm text-ink/50 dark:text-bone/50">
              <SpinnerGap size={20} className="animate-spin" />
              Loading bookings…
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-16 text-center">
              <CalendarBlank size={32} className="text-moss/50" />
              <p className="text-sm font-semibold text-ink dark:text-bone">
                No bookings found
              </p>
              <p className="text-xs text-ink/50 dark:text-bone/50">
                New consultation requests will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-moss/15 text-[11px] font-bold uppercase tracking-wider text-ink/45 dark:border-bone/10 dark:text-bone/45">
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Preferred</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Received</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      onClick={() => setSelected(booking)}
                      className="cursor-pointer border-b border-moss/10 transition-colors last:border-0 hover:bg-moss-light/40 dark:border-bone/10 dark:hover:bg-bone/5"
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-ink dark:text-bone">
                          {booking.name || "Unnamed"}
                        </p>
                        <p className="text-xs text-ink/50 dark:text-bone/50">
                          {booking.email}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-ink/80 dark:text-bone/80">
                        {booking.service}
                      </td>
                      <td className="px-4 py-3 text-ink/80 dark:text-bone/80">
                        {booking.date || "—"}
                        {booking.timeSlot ? (
                          <span className="block text-xs text-ink/50 dark:text-bone/50">
                            {booking.timeSlot}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-ink/60 dark:text-bone/60">
                        {formatDateTime(booking.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <CaretRight
                          size={16}
                          className="inline text-ink/40 dark:text-bone/40"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {selected ? (
        <BookingDetail
          booking={selected}
          getToken={getToken}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
        />
      ) : null}
    </div>
  );
}
