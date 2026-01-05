import clsx from "clsx";

export type ShellFooterContent = {
  heading: string;
  body: string;
  email: string;
  notesLabel: string;
  notesHref: string;
  resumeLabel: string;
  resumeHref: string;
  closing: string;
};

export type ShellFooterProps = {
  className?: string;
  content: ShellFooterContent;
};

export function ShellFooter({ className, content }: ShellFooterProps) {
  const startYear = 2025;
  const currentYear = new Date().getFullYear();
  const yearRange = `${startYear} - ${currentYear}`;
  const closingCopy = content.closing.replace(/^2025/, yearRange);

  return (
    <footer
      className={clsx(
        "shell-footer border-t border-border bg-surface py-10 text-sm text-textMuted dark:border-dark-border dark:bg-dark-surface dark:text-dark-textMuted",
        className
      )}
    >
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="grid gap-6 md:grid-cols-[2fr_1fr] md:items-start md:gap-10">
          <div className="space-y-2">
            <p className="text-base font-semibold text-text dark:text-dark-text">
              {content.heading}
            </p>
            <p className="max-w-md leading-relaxed">{content.body}</p>
          </div>
          <div className="flex flex-col gap-4 text-sm md:items-end md:text-right">
            <a
              href={`mailto:${content.email}`}
              className="hover:text-text dark:hover:text-dark-text"
            >
              {content.email}
            </a>
            <a
              href={content.notesHref}
              className="hover:text-text dark:hover:text-dark-text"
            >
              {content.notesLabel}
            </a>
            <a
              href={content.resumeHref}
              className="hover:text-text dark:hover:text-dark-text"
            >
              {content.resumeLabel}
            </a>
          </div>
        </div>
        <div className="mt-6 text-xs text-textMuted dark:text-dark-textMuted">
          {closingCopy}
        </div>
      </div>
    </footer>
  );
}
