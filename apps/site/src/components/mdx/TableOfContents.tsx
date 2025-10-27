import type { TocItem } from "../../lib/mdx";

type TableOfContentsProps = {
  items: TocItem[];
  title: string;
};

export function TableOfContents({ items, title }: TableOfContentsProps) {
  if (!items.length) {
    return null;
  }

  return (
    <nav aria-label={title} className="space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
        {title}
      </h2>
      <ul className="space-y-2 text-sm text-textMuted dark:text-dark-textMuted">
        {items.map((item) => (
          <li key={item.id} className="leading-snug">
            <a
              href={`#${item.id}`}
              className="transition hover:text-primary dark:hover:text-dark-primary"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
