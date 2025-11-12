import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Experience | Jack Featherstone",
  description: "Placeholder route for future experience deep dive."
};

export default function ExperiencePage() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col gap-6 px-4 py-16 text-lg">
      <h1 className="text-3xl font-semibold">Experience case studies are on the way.</h1>
      <p>
        This route will host detailed write-ups for my favorite projects and roles. Until the full
        stories land, feel free to{" "}
        <Link href="/en" className="text-accent underline underline-offset-4">
          return home
        </Link>{" "}
        or download the resume for a condensed view.
      </p>
    </main>
  );
}
