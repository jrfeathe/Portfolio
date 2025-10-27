import type { ComponentPropsWithoutRef } from "react";
import type { MDXComponents } from "mdx/types";
import clsx from "clsx";

function createHeading(level: 2 | 3 | 4) {
  const Component = `h${level}` as const;

  const Heading = ({ className, ...props }: ComponentPropsWithoutRef<typeof Component>) => (
    <Component
      className={clsx(
        "group scroll-mt-32 font-semibold tracking-tight text-text dark:text-dark-text",
        {
          "text-3xl": level === 2,
          "text-2xl": level === 3,
          "text-xl": level === 4
        },
        className
      )}
      {...props}
    />
  );

  Heading.displayName = `Heading${level}`;

  return Heading;
}

export const mdxComponents: MDXComponents = {
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  a: ({ className, ...props }) => (
    <a
      className={clsx(
        "font-medium text-primary underline-offset-4 transition hover:underline",
        "dark:text-dark-primary",
        className
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p
      className={clsx(
        "leading-relaxed text-text dark:text-dark-text",
        className
      )}
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul
      className={clsx(
        "list-disc space-y-2 pl-5 text-text dark:text-dark-text",
        className
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={clsx(
        "list-decimal space-y-2 pl-5 text-text dark:text-dark-text",
        className
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }) => (
    <li
      className={clsx(
        "leading-relaxed",
        className
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }) => (
    <pre
      className={clsx(
        "overflow-x-auto rounded-lg border border-border bg-surface p-4 text-sm text-text shadow-inner",
        "dark:border-dark-border dark:bg-dark-surface dark:text-dark-text",
        className
      )}
      {...props}
    />
  ),
  code: ({ className, ...props }) => (
    <code
      className={clsx(
        "rounded-md bg-surface px-1 py-0.5 text-sm text-primary",
        "dark:bg-dark-surface dark:text-dark-primary",
        className
      )}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={clsx(
        "border-l-4 border-border pl-4 italic text-textMuted dark:border-dark-border dark:text-dark-textMuted",
        className
      )}
      {...props}
    />
  ),
  table: ({ className, ...props }) => (
    <div className="overflow-x-auto">
      <table
        className={clsx(
          "w-full border-collapse text-left text-sm",
          className
        )}
        {...props}
      />
    </div>
  ),
  th: ({ className, ...props }) => (
    <th
      className={clsx(
        "border border-border bg-surface px-3 py-2 text-xs font-semibold uppercase text-textMuted",
        "dark:border-dark-border dark:bg-dark-surface dark:text-dark-textMuted",
        className
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      className={clsx(
        "border border-border px-3 py-2 text-text dark:border-dark-border dark:text-dark-text",
        className
      )}
      {...props}
    />
  )
};
