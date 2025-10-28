import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";

import type { JSX } from "react";
import { compileMDX } from "next-mdx-remote/rsc";
import matter from "gray-matter";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkCodeTitles from "remark-code-titles";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "../components/mdx";

function resolveNotesDirectory() {
  const candidates = [
    path.join(process.cwd(), "content/notes"),
    path.join(process.cwd(), "..", "..", "content/notes")
  ];

  for (const directory of candidates) {
    if (fsSync.existsSync(directory)) {
      return directory;
    }
  }

  return candidates[0];
}

const NOTES_DIRECTORY = resolveNotesDirectory();

const SUPPORTED_EXTENSIONS = new Set([".mdx", ".md"]);

export type NoteFrontmatter = {
  title: string;
  summary: string;
  publishedAt: string;
  tags?: string[];
  draft?: boolean;
};

export type TocItem = {
  id: string;
  title: string;
  depth: number;
};

export type Note = {
  slug: string;
  frontmatter: NoteFrontmatter;
  content: JSX.Element;
  toc: TocItem[];
};

export type NoteSummary = {
  slug: string;
  frontmatter: NoteFrontmatter;
};

function normalizeSlug(filename: string) {
  return filename.replace(/\.mdx?$/, "");
}

async function readDirectorySafe(directory: string) {
  try {
    return await fs.readdir(directory);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

function ensureFrontmatter(slug: string, frontmatter: NoteFrontmatter) {
  if (!frontmatter.title) {
    throw new Error(`Note "${slug}" is missing required "title" frontmatter.`);
  }

  if (!frontmatter.summary) {
    throw new Error(`Note "${slug}" is missing required "summary" frontmatter.`);
  }

  if (!frontmatter.publishedAt) {
    throw new Error(
      `Note "${slug}" is missing required "publishedAt" frontmatter.`
    );
  }
}

function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function extractHeadings(content: string): TocItem[] {
  const headingRegex = /^(#{2,6})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(content))) {
    const [, hashes, title] = match;
    const depth = hashes.length;
    const text = title.trim();

    items.push({
      id: slugifyHeading(text),
      title: text.replace(/`/g, ""),
      depth
    });
  }

  return items;
}

async function readNoteSource(slug: string) {
  const potentialFilenames = ["mdx", "md"].map((extension) =>
    path.join(NOTES_DIRECTORY, `${slug}.${extension}`)
  );

  for (const filepath of potentialFilenames) {
    try {
      const source = await fs.readFile(filepath, "utf8");
      return source;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }

  throw new Error(`Note "${slug}" not found in ${NOTES_DIRECTORY}.`);
}

export async function getNoteSlugs() {
  const entries = await readDirectorySafe(NOTES_DIRECTORY);

  return entries
    .filter((entry) => SUPPORTED_EXTENSIONS.has(path.extname(entry)))
    .map(normalizeSlug)
    .sort();
}

export async function getNoteSummaries() {
  const slugs = await getNoteSlugs();

  const summaries = await Promise.all(
    slugs.map(async (slug) => {
      const { frontmatter } = await getNote(slug);

      return {
        slug,
        frontmatter
      } satisfies NoteSummary;
    })
  );

  return summaries
    .filter((summary) => !summary.frontmatter.draft)
    .sort((a, b) => {
      const first = new Date(b.frontmatter.publishedAt).getTime();
      const second = new Date(a.frontmatter.publishedAt).getTime();
      return first - second;
    });
}

export async function getNote(slug: string): Promise<Note> {
  const source = await readNoteSource(slug);
  const { content: markdownBody } = matter(source);

  const { content, frontmatter } = await compileMDX<NoteFrontmatter>({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkCodeTitles, remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              properties: {
                className: ["heading-anchor"],
                "aria-label": "Link to this section"
              },
              behaviour: "append",
              content: [
                {
                  type: "element",
                  tagName: "span",
                  properties: {
                    className: ["sr-only"]
                  },
                  children: [
                    {
                      type: "text",
                      value: "Link to this section"
                    }
                  ]
                },
                {
                  type: "element",
                  tagName: "span",
                  properties: {
                    className: ["icon", "icon-link"],
                    "aria-hidden": "true"
                  },
                  children: []
                }
              ]
            }
          ]
        ]
      }
    }
  });

  ensureFrontmatter(slug, frontmatter);

  const toc = extractHeadings(markdownBody);

  return {
    slug,
    frontmatter,
    content,
    toc
  };
}
