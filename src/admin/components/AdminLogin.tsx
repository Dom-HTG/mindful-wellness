import { useState, type FormEvent } from "react";
import {
  GoogleLogo,
  Plant,
  ShieldCheck,
  WarningCircle,
} from "@phosphor-icons/react";
import { useAdminAuth } from "../AdminAuthProvider";
import { isDevAuthAvailable } from "../../lib/firebase";
import { Button } from "../../components/ui/Button";

export function AdminLogin() {
  const { signIn, devSignIn, signingIn, error, mode } = useAdminAuth();
  const [email, setEmail] = useState("support@mindfulwellness.io");

  const handleDevSubmit = (e: FormEvent) => {
    e.preventDefault();
    void devSignIn(email);
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bone px-4 py-12 dark:bg-forest-deep">
      <div className="w-full max-w-md rounded-2xl border border-moss/20 bg-bone-50 p-8 shadow-xl dark:border-bone/15 dark:bg-forest">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-moss text-bone-50">
            <Plant size={26} weight="fill" />
          </span>
          <div className="leading-tight">
            <p className="font-display text-lg font-semibold text-ink dark:text-bone">
              Admin Console
            </p>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss dark:text-amber">
              Mindful Wellness
            </p>
          </div>
        </div>

        <h1 className="mt-7 font-display text-2xl font-semibold text-ink dark:text-bone">
          Sign in to manage bookings
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink/60 dark:text-bone/60">
          Access is restricted to authorized clinic staff. Sign in with your
          Google account to continue.
        </p>

        {error ? (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            <WarningCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {mode === "firebase" ? (
          <Button
            fullWidth
            size="lg"
            className="mt-6"
            onClick={() => void signIn()}
            icon={<GoogleLogo size={20} weight="bold" />}
          >
            {signingIn ? "Signing in…" : "Continue with Google"}
          </Button>
        ) : !isDevAuthAvailable ? (
          <div className="mt-6 flex items-start gap-2 rounded-xl border border-amber/40 bg-amber-light/50 p-3 text-xs leading-relaxed text-amber-dark dark:bg-amber/10 dark:text-amber">
            <WarningCircle size={16} className="mt-0.5 shrink-0" />
            <span>
              Google sign-in is not configured. Set the Firebase environment
              variables to enable admin authentication.
            </span>
          </div>
        ) : (
          <form onSubmit={handleDevSubmit} className="mt-6 space-y-3">
            <div className="rounded-xl border border-dashed border-amber/50 bg-amber-light/50 p-3 text-[11px] leading-relaxed text-amber-dark dark:bg-amber/10 dark:text-amber">
              <strong>Local development mode.</strong> Google sign-in is not
              configured. Enter an email to simulate an authenticated admin.
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full rounded-xl border border-moss/30 bg-bone px-3.5 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-moss dark:border-bone/20 dark:bg-forest-deep dark:text-bone"
            />
            <Button fullWidth size="lg" type="submit">
              Continue in dev mode
            </Button>
          </form>
        )}

        <div className="mt-6 flex items-center gap-2 border-t border-moss/15 pt-5 text-[11px] text-ink/50 dark:border-bone/10 dark:text-bone/50">
          <ShieldCheck size={14} className="text-moss dark:text-amber" />
          Sessions are verified against the clinic admin allowlist.
        </div>
      </div>
    </div>
  );
}
