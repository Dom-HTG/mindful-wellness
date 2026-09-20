import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

type Variant = "primary" | "secondary" | "moss" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  href?: string;
  to?: string;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  ariaLabel?: string;
}

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-bone dark:focus-visible:ring-offset-forest-deep active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-amber text-bone-50 hover:bg-amber-dark shadow-sm hover:shadow-md",
  secondary:
    "border border-moss/40 text-moss hover:bg-moss hover:text-bone-50 dark:text-bone dark:border-bone/30 dark:hover:bg-moss dark:hover:border-moss",
  moss: "bg-moss text-bone-50 hover:bg-moss-dark shadow-sm hover:shadow-md",
  ghost:
    "text-ink/70 hover:text-moss dark:text-bone/70 dark:hover:text-amber underline-offset-4 hover:underline",
};

const sizes: Record<Size, string> = {
  sm: "text-sm px-4 py-2",
  md: "text-sm px-6 py-3",
  lg: "text-base px-8 py-4",
};

export function Button({
  variant = "primary",
  size = "md",
  href,
  to,
  icon,
  iconRight,
  fullWidth,
  children,
  className,
  onClick,
  type = "button",
  ariaLabel,
}: ButtonProps) {
  const classes = cn(
    base,
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className,
  );

  if (to) {
    return (
      <Link to={to} onClick={onClick} className={classes} aria-label={ariaLabel}>
        {icon}
        {children}
        {iconRight}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={classes}
        aria-label={ariaLabel}
      >
        {icon}
        {children}
        {iconRight}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      aria-label={ariaLabel}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  );
}
