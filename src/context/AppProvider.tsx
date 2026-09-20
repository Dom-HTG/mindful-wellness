import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ToastItem {
  id: number;
  message: string;
}

interface AppContextValue {
  theme: Theme;
  toggleTheme: () => void;
  bookingOpen: boolean;
  bookingService: string;
  bookingNotes: string;
  openBooking: (service?: string, notes?: string) => void;
  closeBooking: () => void;
  qrOpen: boolean;
  qrService: string;
  openQr: (service?: string) => void;
  closeQr: () => void;
  chatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toasts: ToastItem[];
  toast: (message: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("mw-theme");
  if (stored === "dark") return "dark";
  return "light";
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingService, setBookingService] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [qrOpen, setQrOpen] = useState(false);
  const [qrService, setQrService] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("mw-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const toast = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const openBooking = useCallback((service = "", notes = "") => {
    setBookingService(service);
    setBookingNotes(notes);
    setBookingOpen(true);
  }, []);

  const closeBooking = useCallback(() => setBookingOpen(false), []);

  const openQr = useCallback((service = "") => {
    setQrService(service);
    setQrOpen(true);
  }, []);

  const closeQr = useCallback(() => setQrOpen(false), []);

  const openChat = useCallback(() => setChatOpen(true), []);
  const closeChat = useCallback(() => setChatOpen(false), []);

  const value = useMemo<AppContextValue>(
    () => ({
      theme,
      toggleTheme,
      bookingOpen,
      bookingService,
      bookingNotes,
      openBooking,
      closeBooking,
      qrOpen,
      qrService,
      openQr,
      closeQr,
      chatOpen,
      openChat,
      closeChat,
      toasts,
      toast,
    }),
    [
      theme,
      toggleTheme,
      bookingOpen,
      bookingService,
      bookingNotes,
      openBooking,
      closeBooking,
      qrOpen,
      qrService,
      openQr,
      closeQr,
      chatOpen,
      openChat,
      closeChat,
      toasts,
      toast,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
