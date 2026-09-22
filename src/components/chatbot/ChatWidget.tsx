import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ChatCircleDots,
  X,
  PaperPlaneTilt,
  Sparkle,
  CalendarCheck,
} from "@phosphor-icons/react";
import { useApp } from "../../context/AppProvider";
import {
  streamChat,
  type BookingConfirmation,
  type ChatTurn,
} from "../../lib/chatApi";

export interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    role: "assistant",
    text: "Hi, I'm the Mindful Wellness assistant. I can answer questions and help you book a consultation.",
  },
];

const QUICK_REPLIES = [
  "What programs do you offer?",
  "Do you take insurance?",
  "Book a consultation",
];

export function ChatWidget() {
  const { openBooking, chatOpen: open, openChat, closeChat, toast } = useApp();
  const reduce = useReducedMotion();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [confirmed, setConfirmed] = useState<BookingConfirmation | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const setOpen = (v: boolean) => (v ? openChat() : closeChat());

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, pending]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeChat();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeChat]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    [],
  );

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending) return;

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
    };
    const assistantId = `a-${Date.now()}`;
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: "assistant",
      text: "",
    };

    const history: ChatTurn[] = [...messages, userMessage].map((m) => ({
      role: m.role,
      content: m.text,
    }));

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setDraft("");
    setPending(true);

    const controller = new AbortController();
    abortRef.current = controller;

    await streamChat(
      history,
      {
        onToken: (value) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, text: m.text + value } : m,
            ),
          );
        },
        onBooking: (booking) => {
          setConfirmed(booking);
          toast(`Consultation requested for ${booking.date} (${booking.timeSlot}).`);
        },
        onError: (message) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId && !m.text ? { ...m, text: message } : m,
            ),
          );
        },
        onDone: () => {
          setPending(false);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId && !m.text
                ? {
                    ...m,
                    text: "Sorry, I didn't catch that. Could you try again?",
                  }
                : m,
            ),
          );
        },
      },
      { signal: controller.signal, booking: confirmed },
    );

    abortRef.current = null;
  };

  return (
    <>
      <button
        type="button"
        onClick={() => (open ? closeChat() : openChat())}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed right-6 bottom-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-moss text-bone-50 shadow-xl transition-colors hover:bg-moss-dark"
      >
        {open ? <X size={24} /> : <ChatCircleDots size={26} weight="fill" />}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-3 bottom-24 left-3 z-50 flex max-h-[72dvh] flex-col overflow-hidden rounded-2xl border border-moss/20 bg-bone shadow-2xl sm:right-6 sm:left-auto sm:w-[380px]"
          >
            <div className="flex items-center gap-3 border-b border-moss/15 bg-forest px-4 py-3.5 text-bone">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bone/10">
                <Sparkle size={18} weight="fill" className="text-amber" />
              </span>
              <div className="flex-1 leading-tight">
                <p className="font-display text-sm font-semibold">
                  Wellness Assistant
                </p>
                <p className="flex items-center gap-1.5 text-[11px] text-bone/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {pending ? "Typing…" : "Online"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="flex h-8 w-8 items-center justify-center rounded-full text-bone/70 transition-colors hover:bg-bone/10 hover:text-bone"
              >
                <X size={18} />
              </button>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto bg-moss-light/40 px-4 py-4"
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.role === "user" ? "flex justify-end" : "flex justify-start"
                  }
                >
                  {m.role === "assistant" && !m.text ? (
                    <span className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-moss/15 bg-bone px-3.5 py-3">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-moss/50" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-moss/50 [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-moss/50 [animation-delay:300ms]" />
                    </span>
                  ) : (
                    <p
                      className={
                        m.role === "user"
                          ? "max-w-[85%] rounded-2xl rounded-br-sm bg-moss px-3.5 py-2.5 text-sm text-bone-50"
                          : "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-sm border border-moss/15 bg-bone px-3.5 py-2.5 text-sm text-ink"
                      }
                    >
                      {m.text}
                    </p>
                  )}
                </div>
              ))}

              {confirmed ? (
                <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-300/60 bg-emerald-50 px-3.5 py-3 text-xs text-emerald-900">
                  <CalendarCheck size={18} weight="fill" className="mt-0.5 shrink-0 text-emerald-600" />
                  <div className="space-y-0.5">
                    <p className="font-semibold">Consultation requested</p>
                    <p>
                      {confirmed.service} · {confirmed.date} · {confirmed.timeSlot}
                    </p>
                    <p className="text-emerald-700/80">
                      Reference {confirmed.id.slice(0, 8)}
                    </p>
                  </div>
                </div>
              ) : null}

              {!pending && messages.length <= 2 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {QUICK_REPLIES.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => void send(q)}
                      className="rounded-full border border-moss/25 bg-bone px-3 py-1.5 text-xs font-medium text-ink/80 transition-colors hover:border-moss hover:text-moss"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(draft);
              }}
              className="flex items-center gap-2 border-t border-moss/15 bg-bone px-3 py-3"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask a question…"
                aria-label="Chat message"
                disabled={pending}
                className="min-w-0 flex-1 rounded-xl border border-moss/25 bg-bone px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-moss disabled:opacity-60"
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={pending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber text-bone-50 transition-colors hover:bg-amber-dark disabled:opacity-60"
              >
                <PaperPlaneTilt size={18} weight="fill" />
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openBooking();
              }}
              className="border-t border-moss/15 bg-moss-light/60 py-2.5 text-center text-xs font-semibold text-moss transition-colors hover:bg-moss-light"
            >
              Prefer to talk now? Book a free consultation
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
