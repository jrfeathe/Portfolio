"use client";

import { Button } from "@portfolio/ui";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">
        Building a living portfolio experience.
      </h1>
      <p className="max-w-xl text-base text-neutral-300">
        This monorepo bundles the site, shared UI kit, CLI helpers, and
        infrastructure experiments into one workspace. Explore the packages
        directory to see what powers the project under the hood.
      </p>
      <Button variant="primary" onClick={() => alert("Welcome aboard!")}>
        View Workspace Overview
      </Button>
    </main>
  );
}
