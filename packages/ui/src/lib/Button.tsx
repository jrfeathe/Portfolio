import type { ButtonHTMLAttributes } from "react";
import { forwardRef } from "react";
import clsx from "clsx";

import { FOCUS_VISIBLE_RING } from "./utils";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accentOn hover:bg-accentHover dark:bg-dark-accent dark:text-dark-accentOn dark:hover:bg-dark-accentHover shadow-sm",
  secondary:
    "bg-surface text-text hover:bg-surfaceMuted dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-surfaceMuted shadow-xs",
  ghost:
    "bg-transparent text-text hover:bg-surfaceMuted dark:text-dark-text dark:hover:bg-dark-surfaceMuted"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
          FOCUS_VISIBLE_RING,
          VARIANT_STYLES[variant],
          className
        )}
        {...props}
      />
    );
  }
);
