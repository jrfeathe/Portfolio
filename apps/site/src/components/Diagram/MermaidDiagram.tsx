"use client";

import { useEffect, useId, useState } from "react";
import mermaid from "mermaid";

type MermaidDiagramProps = {
  source: string;
  className?: string;
};

type RenderState = "idle" | "loading" | "ready" | "error";

export function MermaidDiagram({ source, className }: MermaidDiagramProps) {
  const [svg, setSvg] = useState<string | null>(null);
  const [state, setState] = useState<RenderState>("idle");
  const [error, setError] = useState<string | null>(null);
  const renderId = useId().replace(/:/g, "-");

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      setState("loading");
      setError(null);

      try {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "default"
        });

        const { svg } = await mermaid.render(`mermaid-${renderId}`, source);
        if (!cancelled) {
          setSvg(svg);
          setState("ready");
        }
      } catch (diagramError) {
        if (!cancelled) {
          setState("error");
          setError(
            diagramError instanceof Error
              ? diagramError.message
              : "Unable to render Mermaid diagram."
          );
        }
      }
    };

    render();

    return () => {
      cancelled = true;
    };
  }, [source, renderId]);

  if (state === "error") {
    return (
      <div className="rounded-md border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
        {error ?? "Mermaid diagram failed to render."}
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="rounded-md border border-border bg-surface p-4 text-sm text-textMuted dark:border-dark-border dark:bg-dark-surface dark:text-dark-textMuted">
        Rendering diagram…
      </div>
    );
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: svg }}
      aria-label="Mermaid diagram"
    />
  );
}
