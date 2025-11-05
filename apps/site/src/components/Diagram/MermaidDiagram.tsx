"use client";

import { useEffect, useId, useRef, useState } from "react";

export type MermaidDiagramProps = {
  source: string;
  className?: string;
};

type RenderState = "idle" | "loading" | "ready" | "error";

export function MermaidDiagram({ source, className }: MermaidDiagramProps) {
  const [svg, setSvg] = useState<string | null>(null);
  const [state, setState] = useState<RenderState>("idle");
  const [error, setError] = useState<string | null>(null);
  const renderId = useId().replace(/:/g, "-");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      setState("loading");
      setError(null);

      try {
        const { default: mermaid } = await import("mermaid");

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

  useEffect(() => {
    if (!svg) {
      return;
    }

    const nonce = document?.body?.dataset?.cspNonce;
    if (!nonce) {
      return;
    }

    const root = containerRef.current;
    if (!root) {
      return;
    }

    const styles = root.querySelectorAll("style");
    styles.forEach((style) => {
      style.setAttribute("nonce", nonce);
    });
  }, [svg]);

  if (state === "error") {
    return (
      <div className="rounded-md border border-danger bg-surface p-4 text-sm font-medium text-danger dark:border-dark-danger dark:bg-dark-surface dark:text-dark-danger">
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
      ref={containerRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: svg }}
      aria-label="Mermaid diagram"
      role="img"
    />
  );
}
