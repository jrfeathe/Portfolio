import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ForwardedRef
} from "react";
import { forwardRef } from "react";
import clsx from "clsx";

import { FOCUS_VISIBLE_RING } from "./utils";

export type ButtonVariant = "primary" | "secondary" | "ghost";

type AnchoredButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: ButtonVariant;
};

type NativeButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: undefined;
  variant?: ButtonVariant;
};

export type ButtonProps = AnchoredButtonProps | NativeButtonProps;

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accentOn hover:bg-accentHover dark:bg-dark-accent dark:text-dark-accentOn dark:hover:bg-dark-accentHover shadow-sm",
  secondary:
    "bg-surface text-text hover:bg-surfaceMuted dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-surfaceMuted shadow-xs",
  ghost:
    "bg-transparent text-text hover:bg-surfaceMuted dark:text-dark-text dark:hover:bg-dark-surfaceMuted"
};

function isAnchoredButtonProps(
  props: ButtonProps
): props is AnchoredButtonProps {
  return typeof (props as AnchoredButtonProps).href === "string";
}

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>((props, ref) => {
  const baseClassName = clsx(
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
    FOCUS_VISIBLE_RING
  );

  if (isAnchoredButtonProps(props)) {
    const {
      className,
      variant = "primary",
      href,
      type: _ignoredType,
      ...anchorProps
    } = props;
    return (
      <a
        ref={ref as ForwardedRef<HTMLAnchorElement>}
        href={href}
        className={clsx(baseClassName, VARIANT_STYLES[variant], className)}
        {...anchorProps}
      />
    );
  }

  const { className, variant = "primary", type, ...buttonProps } = props;
  const buttonType: ButtonHTMLAttributes<HTMLButtonElement>["type"] =
    type ?? "button";

  return (
    <button
      ref={ref as ForwardedRef<HTMLButtonElement>}
      type={buttonType}
      className={clsx(baseClassName, VARIANT_STYLES[variant], className)}
      {...buttonProps}
    />
  );
});
