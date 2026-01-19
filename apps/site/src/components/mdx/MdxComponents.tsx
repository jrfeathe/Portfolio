import { Children } from "react";
import type { ComponentPropsWithoutRef } from "react";
import clsx from "clsx";
import type { MDXComponents } from "mdx/types";
import { ResponsiveImage } from "../ResponsiveImage";
import type { ImageDescriptor } from "../../lib/images";

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
  a: ({ className, children, ...props }) => {
    const hasChildren = Children.count(children) > 0;
    const fallback =
      hasChildren || typeof props["aria-label"] !== "string"
        ? null
        : props["aria-label"];

    return (
      <a
        className={clsx(
          "font-medium text-primary underline-offset-4 transition hover:underline",
          "dark:text-dark-primary",
          className
        )}
        {...props}
      >
        {hasChildren ? children : fallback ? (
          <span className="sr-only">{fallback}</span>
        ) : null}
      </a>
    );
  },
  p: ({ className, ...props }) => (
    <p
      className={clsx(
        "leading-relaxed text-text dark:text-dark-text",
        className
      )}
      {...props}
    />
  ),
  IndentedParagraph: ({ className, style, ...props }) => (
    <div
      className={clsx(
        "mdx-indented leading-relaxed text-text dark:text-dark-text",
        className
      )}
      style={style}
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
  img: ({ className, src, alt, width, height }) => {
    if (typeof src !== "string") {
      return null;
    }

    const parsedWidth =
      typeof width === "number"
        ? width
        : typeof width === "string"
        ? Number.parseInt(width, 10)
        : undefined;
    const parsedHeight =
      typeof height === "number"
        ? height
        : typeof height === "string"
        ? Number.parseInt(height, 10)
        : undefined;

    if (!parsedWidth || !parsedHeight) {
      const descriptor: ImageDescriptor = {
        src,
        alt: typeof alt === "string" ? alt : "",
        width: 1200,
        height: 720
      };

      return (
        <ResponsiveImage
          image={descriptor}
          preset="content"
          className={clsx("my-6 w-full", className)}
        />
      );
    }

    const descriptor: ImageDescriptor = {
      src,
      alt: typeof alt === "string" ? alt : "",
      width: parsedWidth,
      height: parsedHeight
    };

    return (
      <ResponsiveImage
        image={descriptor}
        preset="content"
        className={clsx("my-6 w-full", className)}
      />
    );
  },
  pre: ({ className, children, ...props }) => (
    <pre
      className={clsx(
        "overflow-x-auto rounded-lg border border-border bg-surface p-4 text-sm text-text shadow-inner",
        "dark:border-dark-border dark:bg-dark-surface dark:text-dark-text",
        className
      )}
      {...props}
    >
      {children}
    </pre>
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
