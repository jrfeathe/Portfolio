import type { NoteFrontmatter } from "../../lib/mdx";

type NoteHeaderProps = {
  frontmatter: Pick<NoteFrontmatter, "title" | "summary" | "publishedAt" | "tags">;
  locale: string;
};

function formatDate(input: string, locale: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return input;
  }

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "UTC"
  }).format(date);
}

export function NoteHeader({ frontmatter, locale }: NoteHeaderProps) {
  const { title, summary, publishedAt, tags = [] } = frontmatter;

  return (
    <header className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
          {formatDate(publishedAt, locale)}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      </div>
      <p className="text-base text-textMuted dark:text-dark-textMuted">
        {summary}
      </p>
      {tags.length ? (
        <ul className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-border px-3 py-1 text-xs font-medium uppercase tracking-wide text-textMuted dark:border-dark-border dark:text-dark-textMuted"
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
    </header>
  );
}
