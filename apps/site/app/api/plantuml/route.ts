import { NextResponse } from "next/server";

import {
  buildPlantUmlUrl,
  validateDiagramSource,
  validateSvg
} from "../../../src/lib/diagram";
import type { PlantUmlFormat } from "../../../src/lib/diagram";

const ALLOWED_FORMATS: PlantUmlFormat[] = ["svg"];
const CACHE_SECONDS = 60 * 60 * 6; // 6 hours

type PlantUmlRequestBody = {
  diagram?: string;
  format?: PlantUmlFormat;
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: PlantUmlRequestBody;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const diagram = payload.diagram ?? "";
  const format = (payload.format ?? "svg") as PlantUmlFormat;

  if (!ALLOWED_FORMATS.includes(format)) {
    return NextResponse.json(
      { error: `Unsupported format "${format}".` },
      { status: 400 }
    );
  }

  try {
    validateDiagramSource(diagram);
  } catch (validationError) {
    return NextResponse.json(
      {
        error:
          validationError instanceof Error
            ? validationError.message
            : "Invalid diagram source."
      },
      { status: 400 }
    );
  }

  const upstreamUrl = buildPlantUmlUrl(diagram, format);

  try {
    const response = await fetch(upstreamUrl, {
      headers: {
        "User-Agent": "portfolio-plantuml-proxy/1.0"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Upstream PlantUML server returned an error." },
        { status: 502 }
      );
    }

    const svg = await response.text();
    validateSvg(svg);

    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": `public, max-age=0, s-maxage=${CACHE_SECONDS}`,
        "Content-Security-Policy":
          "default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src 'none';",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch PlantUML diagram."
      },
      { status: 500 }
    );
  }
}
