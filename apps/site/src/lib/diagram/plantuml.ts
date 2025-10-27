import { encode } from "plantuml-encoder";

const DEFAULT_SERVER = "https://www.plantuml.com/plantuml";
const MAX_DIAGRAM_LENGTH = 10000;

export type PlantUmlFormat = "svg" | "png";

export function getPlantUmlServer() {
  return process.env.PLANTUML_SERVER?.replace(/\/+$/, "") ?? DEFAULT_SERVER;
}

export function validateDiagramSource(source: string) {
  if (!source.trim().length) {
    throw new Error("Diagram source must not be empty.");
  }

  if (source.length > MAX_DIAGRAM_LENGTH) {
    throw new Error(
      `Diagram exceeds maximum length of ${MAX_DIAGRAM_LENGTH} characters.`
    );
  }

  return source;
}

export function buildPlantUmlUrl(
  source: string,
  format: PlantUmlFormat = "svg"
) {
  if (!["svg", "png"].includes(format)) {
    throw new Error(`Unsupported PlantUML format: ${format}`);
  }

  const encoded = encode(source);
  const baseUrl = getPlantUmlServer();

  return `${baseUrl}/${format}/${encoded}`;
}
