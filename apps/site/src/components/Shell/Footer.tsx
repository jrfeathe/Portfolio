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
  content?: ShellFooterContent;
};

const DEFAULT_FOOTER_CONTENT: ShellFooterContent = {
  heading: "Jack Featherstone - Software Engineering Portfolio",
  body: "Showcasing my purpose, skills, achievements, and interests!",
  email: "jfstone2000@proton.me",
  notesLabel: "Engineering notes",
  notesHref: "/notes",
  resumeLabel: "Resume (PDF)",
  resumeHref: "/resume.pdf",
  closing: "2025. Jack Featherstone. Built with Codex, Next.js, pnpm, and spiritual pressure."
};

export function ShellFooter({ className, content }: ShellFooterProps) {
  const footerContent = content ?? DEFAULT_FOOTER_CONTENT;

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
              {footerContent.heading}
            </p>
            <p className="max-w-md leading-relaxed">{footerContent.body}</p>
          </div>
          <div className="flex flex-col gap-4 text-sm md:items-end md:text-right">
            <a
              href={`mailto:${footerContent.email}`}
              className="hover:text-text dark:hover:text-dark-text"
            >
              {footerContent.email}
            </a>
            <a
              href={footerContent.notesHref}
              className="hover:text-text dark:hover:text-dark-text"
            >
              {footerContent.notesLabel}
            </a>
            <a
              href={footerContent.resumeHref}
              className="hover:text-text dark:hover:text-dark-text"
            >
              {footerContent.resumeLabel}
            </a>
          </div>
        </div>
        <div className="mt-6 text-xs text-textMuted dark:text-dark-textMuted">
          {footerContent.closing}
        </div>
      </div>
    </footer>
  );
}
