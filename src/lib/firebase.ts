import type { Auth, User } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as
    | string
    | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as
    | string
    | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

export const firebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
);

export const isDevAuthAvailable =
  import.meta.env.DEV && !firebaseConfigured;

let authPromise: Promise<Auth | null> | null = null;

async function getFirebaseAuth(): Promise<Auth | null> {
  if (!firebaseConfigured) return null;
  if (!authPromise) {
    authPromise = (async () => {
      const { initializeApp, getApps } = await import("firebase/app");
      const { getAuth } = await import("firebase/auth");
      const app = getApps()[0] ?? initializeApp(firebaseConfig);
      return getAuth(app);
    })();
  }
  return authPromise;
}

export async function signInWithGoogle(): Promise<User | null> {
  const auth = await getFirebaseAuth();
  if (!auth) return null;
  const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signOutFirebase(): Promise<void> {
  const auth = await getFirebaseAuth();
  if (!auth) return;
  const { signOut } = await import("firebase/auth");
  await signOut(auth);
}

export async function getFirebaseIdToken(): Promise<string | null> {
  const auth = await getFirebaseAuth();
  if (!auth?.currentUser) return null;
  return auth.currentUser.getIdToken();
}

export async function subscribeToFirebaseAuth(
  callback: (user: User | null) => void,
): Promise<() => void> {
  const auth = await getFirebaseAuth();
  if (!auth) return () => undefined;
  const { onAuthStateChanged } = await import("firebase/auth");
  return onAuthStateChanged(auth, callback);
}
