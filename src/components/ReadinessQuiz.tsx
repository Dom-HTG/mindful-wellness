import { useState } from "react";
import { Question, ArrowRight, CheckCircle, Sparkle } from "@phosphor-icons/react";
import {
  QUIZ_QUESTIONS,
  QUIZ_ACTION_PLAN,
  scoreQuiz,
  recommendedServiceFromAnswers,
  buildQuizNotes,
} from "../lib/quiz";
import { useApp } from "../context/AppProvider";
import { Container } from "./ui/Container";
import { Button } from "./ui/Button";
import { Reveal } from "./ui/Reveal";

type View = "intro" | "questions" | "results";

export function ReadinessQuiz() {
  const { openBooking, toast } = useApp();
  const [view, setView] = useState<View>("intro");
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const total = QUIZ_QUESTIONS.length;

  const start = () => {
    setStep(1);
    setAnswers({});
    setView("questions");
  };

  const selectOption = (questionId: number, value: string) => {
    const next = { ...answers, [questionId]: value };
    setAnswers(next);
    toast(`Selected: ${value}`);
    if (step < total) {
      setStep(step + 1);
    } else {
      setView("results");
    }
  };

  const result = view === "results" ? scoreQuiz(answers) : null;
  const progress = Math.round((step / total) * 100);
  const question = QUIZ_QUESTIONS[step - 1];

  return (
    <section
      id="quiz"
      className="border-b border-moss/10 bg-gradient-to-b from-bone via-moss-light/40 to-bone py-20 dark:border-bone/10 dark:from-forest-deep dark:via-forest/40 dark:to-forest-deep md:py-28"
    >
      <Container className="max-w-4xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-moss/15 bg-bone p-8 shadow-lg dark:border-bone/10 dark:bg-forest-deep/70 md:p-12">
            <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-amber/10 blur-2xl" />

            {view === "intro" ? (
              <div className="space-y-6 text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-moss/20 bg-moss-light px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-moss dark:border-bone/15 dark:bg-bone/5 dark:text-amber">
                  <Question size={16} />
                  Interactive Self-Assessment
                </span>
                <h2 className="font-display text-3xl font-semibold text-ink md:text-4xl dark:text-bone text-balance">
                  Is holistic weight management right for you?
                </h2>
                <p className="mx-auto max-w-xl leading-relaxed text-ink/70 dark:text-bone/70">
                  Take this confidential 60-second assessment to discover your
                  weight management archetype and receive a personalized care
                  blueprint.
                </p>
                <Button size="lg" variant="moss" onClick={start} iconRight={<ArrowRight size={20} />}>
                  Start the 1-Minute Quiz
                </Button>
              </div>
            ) : null}

            {view === "questions" && question ? (
              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-ink/60 dark:text-bone/60">
                    <span>
                      Question {step} of {total}
                    </span>
                    <span>{progress}% Complete</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-moss-light dark:bg-bone/10">
                    <div
                      className="h-full rounded-full bg-moss transition-all duration-500 dark:bg-amber"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-ink dark:text-bone">
                    {question.prompt}
                  </h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {question.options.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => selectOption(question.id, opt.value)}
                        className="group flex items-center justify-between gap-3 rounded-xl border border-moss/20 bg-bone p-4 text-left text-sm font-medium text-ink transition-all duration-200 hover:border-moss hover:bg-moss-light/50 dark:border-bone/15 dark:bg-forest-deep/60 dark:text-bone dark:hover:border-amber dark:hover:bg-bone/5"
                      >
                        <span>{opt.label}</span>
                        <ArrowRight
                          size={18}
                          className="shrink-0 text-moss opacity-0 transition-opacity group-hover:opacity-100 dark:text-amber"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {view === "results" && result ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-moss-light text-moss dark:bg-moss/15 dark:text-amber">
                  <Sparkle size={32} />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss dark:text-amber">
                    Your Customized Assessment
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-ink md:text-3xl dark:text-bone text-balance">
                    {result.title}
                  </h3>
                  <p className="mx-auto max-w-xl leading-relaxed text-ink/70 dark:text-bone/70">
                    {result.description}
                  </p>
                </div>

                <div className="mx-auto max-w-md rounded-xl border border-moss/15 bg-moss-light/40 p-5 text-left dark:border-bone/10 dark:bg-bone/5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-moss dark:text-amber">
                    <CheckCircle size={18} />
                    Recommended Initial Action Plan
                  </div>
                  <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-ink/80 dark:text-bone/80">
                    {QUIZ_ACTION_PLAN.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button
                    onClick={() =>
                      openBooking(
                        recommendedServiceFromAnswers(answers),
                        buildQuizNotes(answers),
                      )
                    }
                  >
                    Book with My Results
                  </Button>
                  <Button variant="ghost" onClick={start}>
                    Retake Assessment
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
