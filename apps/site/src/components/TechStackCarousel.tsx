import Image from "next/image";

import type { AppDictionary } from "../utils/dictionaries";

type TechStackItems = AppDictionary["home"]["sections"]["techStack"]["items"];

export function TechStackCarousel({ items }: { items: TechStackItems }) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="-mx-4 overflow-x-auto pb-3 sm:mx-0 sm:pb-0">
        <ul
          className="grid auto-cols-[minmax(200px,1fr)] grid-flow-col gap-4 overflow-x-auto px-4 pb-1 text-sm sm:auto-cols-auto sm:grid-flow-row sm:px-0 sm:pb-0 md:grid-cols-2 lg:grid-cols-3"
          aria-label="Featured tech stack"
        >
          {items.map((item) => (
            <li
              key={item.name}
              className="snap-start"
            >
              <a
                href={item.href}
                className="group flex h-full items-center gap-4 rounded-2xl border border-border bg-surface px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-accent hover:shadow-lg dark:border-dark-border dark:bg-dark-surface dark:hover:border-dark-accent"
                target="_blank"
                rel="noreferrer noopener"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/40 bg-surfaceMuted dark:border-dark-border/40 dark:bg-dark-surfaceMuted">
                  <Image
                    src={`/tech-stack/${item.assetId}.svg`}
                    alt=""
                    width={48}
                    height={48}
                    className="h-10 w-10 object-contain"
                    aria-hidden
                  />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-semibold text-text dark:text-dark-text">
                    {item.name}
                  </span>
                  <span className="text-xs text-textMuted transition group-hover:text-accent dark:text-dark-textMuted dark:group-hover:text-dark-accent">
                    Docs ↗
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
