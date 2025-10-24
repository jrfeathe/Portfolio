import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accentOn hover:bg-accentHover focus-visible:outline-accentHover dark:bg-dark-accent dark:text-dark-accentOn dark:hover:bg-dark-accentHover dark:focus-visible:outline-dark-accentHover shadow-sm",
  secondary:
    "bg-surface text-text hover:bg-surfaceMuted focus-visible:outline-border dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-surfaceMuted dark:focus-visible:outline-dark-border shadow-xs",
  ghost:
    "bg-transparent text-text hover:bg-surfaceMuted focus-visible:outline-border dark:text-dark-text dark:hover:bg-dark-surfaceMuted dark:focus-visible:outline-dark-border"
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2",
        VARIANT_STYLES[variant],
        className
      )}
      {...props}
    />
  );
}
