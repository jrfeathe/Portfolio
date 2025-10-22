import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-emerald-500 text-neutral-950 hover:bg-emerald-400 focus-visible:outline-emerald-300",
  secondary:
    "bg-neutral-800 text-neutral-50 hover:bg-neutral-700 focus-visible:outline-neutral-500",
  ghost:
    "bg-transparent text-neutral-100 hover:bg-neutral-900 focus-visible:outline-neutral-700"
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
