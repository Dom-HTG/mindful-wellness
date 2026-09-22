import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AdminUser } from "../../backend/admin/types";
import {
  firebaseConfigured,
  getFirebaseIdToken,
  isDevAuthAvailable,
  signInWithGoogle,
  signOutFirebase,
  subscribeToFirebaseAuth,
} from "../lib/firebase";
import { fetchMe } from "./lib/adminApi";

type AdminStatus = "loading" | "signedOut" | "authorized" | "unauthorized";

interface AdminAuthValue {
  status: AdminStatus;
  user: AdminUser | null;
  error: string | null;
  signingIn: boolean;
  mode: "firebase" | "dev";
  signIn: () => Promise<void>;
  devSignIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

const DEV_EMAIL_KEY = "mw-admin-dev-email";

async function getDevToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const email = window.localStorage.getItem(DEV_EMAIL_KEY);
  return email ? `dev:${email}` : null;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AdminStatus>("loading");
  const [user, setUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const mode: "firebase" | "dev" = firebaseConfigured ? "firebase" : "dev";

  const verify = useCallback(async (token: string | null) => {
    if (!token) {
      setUser(null);
      setStatus("signedOut");
      return;
    }
    try {
      const result = await fetchMe(token);
      setUser(result.user);
      setStatus("authorized");
      setError(null);
    } catch (err) {
      setUser(null);
      setStatus("unauthorized");
      setError(
        err instanceof Error ? err.message : "Unable to verify admin access.",
      );
    }
  }, []);

  useEffect(() => {
    let active = true;
    let unsubscribe: () => void = () => undefined;

    if (firebaseConfigured) {
      subscribeToFirebaseAuth(async (fbUser) => {
        if (!active) return;
        if (!fbUser) {
          setUser(null);
          setStatus("signedOut");
          return;
        }
        const token = await fbUser.getIdToken();
        if (active) await verify(token);
      }).then((unsub) => {
        unsubscribe = unsub;
        if (!active) unsub();
      });
    } else if (isDevAuthAvailable) {
      getDevToken().then((token) => {
        if (active) void verify(token);
      });
    } else {
      setStatus("signedOut");
    }

    return () => {
      active = false;
      unsubscribe();
    };
  }, [verify]);

  const getToken = useCallback(async () => {
    if (firebaseConfigured) return getFirebaseIdToken();
    return getDevToken();
  }, []);

  const signIn = useCallback(async () => {
    if (!firebaseConfigured) return;
    setSigningIn(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    } finally {
      setSigningIn(false);
    }
  }, []);

  const devSignIn = useCallback(
    async (email: string) => {
      const trimmed = email.trim().toLowerCase();
      if (!trimmed) return;
      window.localStorage.setItem(DEV_EMAIL_KEY, trimmed);
      setStatus("loading");
      await verify(`dev:${trimmed}`);
    },
    [verify],
  );

  const signOut = useCallback(async () => {
    if (firebaseConfigured) {
      await signOutFirebase();
    } else {
      window.localStorage.removeItem(DEV_EMAIL_KEY);
    }
    setUser(null);
    setStatus("signedOut");
    setError(null);
  }, []);

  const value = useMemo<AdminAuthValue>(
    () => ({
      status,
      user,
      error,
      signingIn,
      mode,
      signIn,
      devSignIn,
      signOut,
      getToken,
    }),
    [status, user, error, signingIn, mode, signIn, devSignIn, signOut, getToken],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminAuth(): AdminAuthValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
