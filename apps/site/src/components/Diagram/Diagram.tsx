"use client";

import { MermaidDiagram } from "./MermaidDiagram";
import { PlantUmlDiagram } from "./PlantUmlDiagram";

export type DiagramType = "mermaid" | "plantuml";

type DiagramProps = {
  type: DiagramType;
  source: string;
  className?: string;
};

export function Diagram({ type, source, className }: DiagramProps) {
  if (type === "mermaid") {
    return <MermaidDiagram source={source} className={className} />;
  }

  if (type === "plantuml") {
    return <PlantUmlDiagram source={source} className={className} />;
  }

  return (
    <div className="rounded-md border border-border bg-surface p-4 text-sm text-textMuted dark:border-dark-border dark:bg-dark-surface dark:text-dark-textMuted">
      Unsupported diagram type: {type}
    </div>
  );
}
