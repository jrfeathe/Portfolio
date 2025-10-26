import type {
  ComponentPropsWithoutRef,
  HTMLAttributes,
  ReactNode
} from "react";
import { forwardRef } from "react";
import clsx from "clsx";

type ChipVariant = "neutral" | "accent" | "outline";

type ChipBaseProps = {
  children: ReactNode;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  variant?: ChipVariant;
};

type ChipSpanProps = ChipBaseProps &
  Omit<ComponentPropsWithoutRef<"span">, keyof ChipBaseProps> & {
    as?: "span";
  };

type ChipButtonProps = ChipBaseProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof ChipBaseProps> & {
    as: "button";
  };

type ChipAnchorProps = ChipBaseProps &
  Omit<ComponentPropsWithoutRef<"a">, keyof ChipBaseProps> & {
    as: "a";
  };

type ChipDivProps = ChipBaseProps &
  Omit<ComponentPropsWithoutRef<"div">, keyof ChipBaseProps> & {
    as: "div";
  };

export type ChipProps =
  | ChipSpanProps
  | ChipButtonProps
  | ChipAnchorProps
  | ChipDivProps;

const VARIANT_STYLES: Record<ChipVariant, string> = {
  neutral:
    "bg-surfaceMuted text-text border border-border dark:bg-dark-surfaceMuted dark:text-dark-text dark:border-dark-border",
  accent:
    "bg-accent text-accentOn border border-accent dark:bg-dark-accent dark:text-dark-accentOn dark:border-dark-accent",
  outline:
    "bg-transparent text-text border border-border dark:text-dark-text dark:border-dark-border"
};

export const Chip = forwardRef<HTMLElement, ChipProps>(function Chip(
  {
    as: Component = "span",
    className,
    leadingIcon,
    trailingIcon,
    children,
    variant = "neutral",
    ...props
  },
  ref
) {
  const resolvedProps =
    Component === "button" && !(props as ChipButtonProps).type
      ? { type: "button", ...props }
      : props;

  return (
    <Component
      ref={ref as never}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-border dark:focus-visible:outline-dark-border",
        VARIANT_STYLES[variant],
        className
      )}
      {...resolvedProps}
    >
      {leadingIcon ? (
        <span aria-hidden className="inline-flex h-4 w-4 items-center justify-center">
          {leadingIcon}
        </span>
      ) : null}
      <span>{children}</span>
      {trailingIcon ? (
        <span aria-hidden className="inline-flex h-4 w-4 items-center justify-center">
          {trailingIcon}
        </span>
      ) : null}
    </Component>
  );
});
