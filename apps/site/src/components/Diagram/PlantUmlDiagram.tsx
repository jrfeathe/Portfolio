"use client";

import { useEffect, useState } from "react";

type PlantUmlDiagramProps = {
  source: string;
  format?: "svg" | "png";
  className?: string;
};

type DiagramState = "idle" | "loading" | "ready" | "error";

export function PlantUmlDiagram({
  source,
  format = "svg",
  className
}: PlantUmlDiagramProps) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<DiagramState>("idle");

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      setState("loading");
      setError(null);
      setSvg(null);

      try {
        const response = await fetch("/api/plantuml", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ diagram: source, format })
        });

        if (!response.ok) {
          throw new Error("PlantUML proxy rejected the request.");
        }

        const contentType =
          response.headers.get("content-type") ?? "image/svg+xml";

        if (format === "svg" && contentType.includes("svg")) {
          const diagram = await response.text();
          if (!cancelled) {
            setSvg(diagram);
            setState("ready");
          }
        } else {
          throw new Error("Only SVG diagrams are currently supported.");
        }
      } catch (diagramError) {
        if (!cancelled) {
          setState("error");
          setError(
            diagramError instanceof Error
              ? diagramError.message
              : "Unable to render PlantUML diagram."
          );
        }
      }
    };

    render();

    return () => {
      cancelled = true;
    };
  }, [format, source]);

  if (state === "error") {
    return (
      <div className="rounded-md border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
        {error ?? "PlantUML diagram failed to render."}
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="rounded-md border border-border bg-surface p-4 text-sm text-textMuted dark:border-dark-border dark:bg-dark-surface dark:text-dark-textMuted">
        Fetching diagram…
      </div>
    );
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: svg }}
      aria-label="PlantUML diagram"
    />
  );
}
