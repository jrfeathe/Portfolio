import type {
  ComponentPropsWithoutRef,
  HTMLAttributes,
  ReactNode
} from "react";
import { forwardRef } from "react";
import clsx from "clsx";

export type CardProps = HTMLAttributes<HTMLDivElement>;

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={clsx(
        "group rounded-2xl border border-border bg-surface p-6 text-text shadow-md transition hover:shadow-lg dark:border-dark-border dark:bg-dark-surface dark:text-dark-text",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

export type CardSectionProps = HTMLAttributes<HTMLDivElement>;

export const CardHeader = forwardRef<HTMLDivElement, CardSectionProps>(
  function CardHeader({ className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx("mb-4 flex flex-col gap-2", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export const CardTitle = forwardRef<
  HTMLHeadingElement,
  ComponentPropsWithoutRef<"h3">
>(function CardTitle({ className, ...props }, ref) {
  return (
    <h3
      ref={ref}
      className={clsx(
        "text-lg font-semibold leading-snug text-text dark:text-dark-text",
        className
      )}
      {...props}
    />
  );
});

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  ComponentPropsWithoutRef<"p">
>(function CardDescription({ className, ...props }, ref) {
  return (
    <p
      ref={ref}
      className={clsx(
        "text-sm leading-relaxed text-textMuted dark:text-dark-textMuted",
        className
      )}
      {...props}
    />
  );
});

export const CardContent = forwardRef<HTMLDivElement, CardSectionProps>(
  function CardContent({ className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx("flex flex-col gap-4", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export const CardFooter = forwardRef<HTMLDivElement, CardSectionProps>(
  function CardFooter({ className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(
          "mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4 dark:border-dark-border",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
