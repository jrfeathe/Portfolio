import clsx from "clsx";

export type ShellFooterProps = {
  className?: string;
};

export function ShellFooter({ className }: ShellFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={clsx(
        "border-t border-border bg-surface py-10 text-sm text-textMuted dark:border-dark-border dark:bg-dark-surface dark:text-dark-textMuted",
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-base font-semibold text-text dark:text-dark-text">
            Jack F. Engineering Portfolio
          </p>
          <p className="max-w-md leading-relaxed">
            Documentation-first case studies, operating notes, and recruiter
            enablement artifacts curated for rapid evaluation.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-sm md:text-right">
          <a
            href="mailto:jack@example.com"
            className="hover:text-text dark:hover:text-dark-text"
          >
            jack@example.com
          </a>
          <a href="/notes" className="hover:text-text dark:hover:text-dark-text">
            Engineering notes
          </a>
          <a
            href="/resume.pdf"
            className="hover:text-text dark:hover:text-dark-text"
          >
            Resume (PDF)
          </a>
        </div>
      </div>
      <div className="mx-auto mt-6 w-full max-w-6xl px-4 text-xs text-textMuted dark:text-dark-textMuted">
        © {year} Jack Smith. Built with Next.js, pnpm, and an obsession with measurable impact.
      </div>
    </footer>
  );
}
