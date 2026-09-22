import { ChatCircleDots, Sparkle, ArrowRight } from "@phosphor-icons/react";
import { useApp } from "../../context/AppProvider";
import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";

const PREVIEW = [
  { role: "assistant", text: "Hi — I'm the Mindful Wellness assistant." },
  { role: "user", text: "Do you help with emotional eating?" },
  {
    role: "assistant",
    text: "We do. Behavioral and psychiatric care sit at the centre of everything we offer.",
  },
];

export function ChatbotSection() {
  const { openChat } = useApp();

  return (
    <section
      id="assistant"
      className="border-y border-moss/10 bg-moss-light/40 py-20 dark:border-bone/10 dark:bg-forest/40 md:py-28"
    >
      <Container>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="space-y-5 lg:col-span-5">
            <p className="inline-flex items-center gap-2 rounded-full border border-moss/20 bg-bone px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-moss dark:border-bone/15 dark:bg-bone/5 dark:text-amber">
              <Sparkle size={14} weight="fill" />
              Live Assistant
            </p>
            <h2 className="font-display text-3xl font-semibold leading-[1.12] text-ink md:text-4xl dark:text-bone text-balance">
              Meet your wellness assistant
            </h2>
            <p className="max-w-md leading-relaxed text-ink/70 dark:text-bone/70">
              A calm, always-available companion for your questions — from how
              our programs work to what a first visit looks like. Ask anything,
              or book a consultation right in the chat.
            </p>
            <button
              type="button"
              onClick={openChat}
              className="inline-flex items-center gap-2 rounded-xl bg-amber px-6 py-3 text-sm font-semibold text-bone-50 shadow-sm transition-colors hover:bg-amber-dark"
            >
              <ChatCircleDots size={18} weight="fill" />
              Start a conversation
              <ArrowRight size={16} />
            </button>
          </Reveal>

          <Reveal className="lg:col-span-7" delay={0.1}>
            <div className="mx-auto max-w-md rounded-2xl border border-moss/15 bg-bone p-5 shadow-lg dark:border-bone/10 dark:bg-forest-deep/70">
              <div className="flex items-center gap-3 border-b border-moss/10 pb-4 dark:border-bone/10">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-moss text-bone-50">
                  <Sparkle size={16} weight="fill" />
                </span>
                <div className="leading-tight">
                  <p className="font-display text-sm font-semibold text-ink dark:text-bone">
                    Wellness Assistant
                  </p>
                  <p className="flex items-center gap-1.5 text-[11px] text-ink/50 dark:text-bone/50">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Online now
                  </p>
                </div>
              </div>
              <div className="space-y-3 pt-4">
                {PREVIEW.map((m, i) => (
                  <div
                    key={i}
                    className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
                  >
                    <p
                      className={
                        m.role === "user"
                          ? "max-w-[85%] rounded-2xl rounded-br-sm bg-moss px-3.5 py-2.5 text-sm text-bone-50"
                          : "max-w-[85%] rounded-2xl rounded-bl-sm border border-moss/15 bg-bone px-3.5 py-2.5 text-sm text-ink dark:border-bone/10 dark:bg-bone/5 dark:text-bone"
                      }
                    >
                      {m.text}
                    </p>
                  </div>
                ))}
                <div className="flex gap-1.5 pt-1 pl-1">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-moss/40" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-moss/40 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-moss/40 [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
