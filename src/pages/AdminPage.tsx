import type { ReactNode } from "react";
import { ShieldSlash, SpinnerGap } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { AdminAuthProvider, useAdminAuth } from "../admin/AdminAuthProvider";
import { AdminLogin } from "../admin/components/AdminLogin";
import { AdminDashboard } from "../admin/components/AdminDashboard";

function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bone px-4 text-center dark:bg-forest-deep">
      {children}
    </div>
  );
}

function AdminGate() {
  const { status, error, signOut } = useAdminAuth();

  if (status === "loading") {
    return (
      <Centered>
        <SpinnerGap size={32} className="animate-spin text-moss" />
        <p className="text-sm text-ink/60 dark:text-bone/60">
          Verifying admin access…
        </p>
      </Centered>
    );
  }

  if (status === "signedOut") {
    return <AdminLogin />;
  }

  if (status === "unauthorized") {
    return (
      <Centered>
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300">
          <ShieldSlash size={28} />
        </span>
        <h1 className="font-display text-xl font-semibold text-ink dark:text-bone">
          Access denied
        </h1>
        <p className="max-w-sm text-sm text-ink/60 dark:text-bone/60">
          {error ??
            "This account is not authorized to access the admin console."}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-xl border border-moss/30 px-4 py-2 text-xs font-semibold text-ink/70 transition-colors hover:border-moss hover:text-moss dark:border-bone/20 dark:text-bone/70"
          >
            Try another account
          </button>
          <Link
            to="/"
            className="text-xs font-semibold text-moss hover:underline dark:text-amber"
          >
            Return to site
          </Link>
        </div>
      </Centered>
    );
  }

  return <AdminDashboard />;
}

export function AdminPage() {
  return (
    <AdminAuthProvider>
      <AdminGate />
    </AdminAuthProvider>
  );
}
