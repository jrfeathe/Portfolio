import { createHash } from "node:crypto";

import { NextResponse } from "next/server";

import { getPublicResume } from "../../lib/public";

const CACHE_CONTROL = "public, max-age=3600, stale-while-revalidate=86400";

function buildEtag(payload: string, version: string) {
  const hash = createHash("sha256").update(payload).digest("hex").slice(0, 12);
  return `W/"resume-json-${version}-${hash}"`;
}

export function GET() {
  const resume = getPublicResume();
  const body = JSON.stringify(resume);
  const response = new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": CACHE_CONTROL,
      ETag: buildEtag(body, resume.version),
      "Content-Length": Buffer.byteLength(body, "utf8").toString()
    }
  });

  if (resume.lastModified) {
    const timestamp = new Date(`${resume.lastModified}T00:00:00Z`).toUTCString();
    response.headers.set("Last-Modified", timestamp);
  }

  return response;
}
