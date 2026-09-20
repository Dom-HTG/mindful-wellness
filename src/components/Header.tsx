import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Plant, QrCode, List, X, Sun, Moon } from "@phosphor-icons/react";
import { useApp } from "../context/AppProvider";
import { Button } from "./ui/Button";
import { cn } from "../lib/utils";

const NAV_LINKS = [
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Readiness Quiz", to: "/#quiz" },
  { label: "Calculator", to: "/#calculator" },
  { label: "Stories", to: "/#testimonials" },
  { label: "FAQ", to: "/#faqs" },
];

export function Header() {
  const { openBooking, openQr, theme, toggleTheme } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  const isActive = (to: string) =>
    to.startsWith("/#") ? false : pathname === to;

  return (
    <header className="sticky top-0 z-40 border-b border-moss/10 bg-bone/85 backdrop-blur-md dark:border-bone/10 dark:bg-forest-deep/85">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 md:h-20 md:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-moss text-bone-50 transition-colors duration-200 hover:bg-moss-dark">
            <Plant size={22} weight="fill" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold text-ink dark:text-bone">
              Mindful Wellness
            </span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-moss dark:text-amber">
              and Behavioural Health
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "relative transition-colors duration-200",
                isActive(link.to)
                  ? "text-moss dark:text-amber"
                  : "text-ink/70 hover:text-moss dark:text-bone/70 dark:hover:text-amber",
              )}
            >
              {link.label}
              {isActive(link.to) ? (
                <span className="absolute -bottom-1.5 left-0 h-px w-full bg-amber" />
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink/70 transition-colors duration-200 hover:bg-moss/10 hover:text-moss dark:text-bone/70 dark:hover:text-amber"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            type="button"
            onClick={() => openQr()}
            aria-label="Open QR code intake"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink/70 transition-colors duration-200 hover:bg-moss/10 hover:text-moss dark:text-bone/70 dark:hover:text-amber"
          >
            <QrCode size={20} />
          </button>
          <Button size="sm" onClick={() => openBooking()}>
            Book a Free Consultation
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-ink transition-colors hover:bg-moss/10 dark:text-bone lg:hidden"
        >
          {menuOpen ? <X size={24} /> : <List size={24} />}
        </button>
      </div>

      {menuOpen ? (
        <div className="border-t border-moss/10 bg-bone px-6 py-6 dark:border-bone/10 dark:bg-forest-deep lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-2 py-3 font-medium text-ink/80 transition-colors hover:bg-moss/10 hover:text-moss dark:text-bone/80 dark:hover:text-amber"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="secondary"
              fullWidth
              icon={<QrCode size={18} />}
              onClick={() => {
                setMenuOpen(false);
                openQr();
              }}
            >
              QR Intake
            </Button>
            <Button
              fullWidth
              onClick={() => {
                setMenuOpen(false);
                openBooking();
              }}
            >
              Book a Free Consultation
            </Button>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-moss/20 py-2.5 text-sm font-medium text-ink/70 dark:border-bone/20 dark:text-bone/70"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            Toggle theme
          </button>
        </div>
      ) : null}
    </header>
  );
}
