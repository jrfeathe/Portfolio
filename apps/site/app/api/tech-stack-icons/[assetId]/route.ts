import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { brotliCompressSync, constants as zlibConstants, gzipSync, type BrotliOptions } from "node:zlib";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ICONS_DIRECTORY = path.join(process.cwd(), "public", "tech-stack");
const BROTLI_OPTIONS: BrotliOptions = {
  params: {
    [zlibConstants.BROTLI_PARAM_MODE]: zlibConstants.BROTLI_MODE_TEXT,
    [zlibConstants.BROTLI_PARAM_QUALITY]: 11
  }
};

type IconCacheEntry = {
  raw: Buffer;
  compressed: Buffer;
  gzip: Buffer;
  etag: string;
};

const iconCache = new Map<string, IconCacheEntry>();

function sanitizeAssetId(rawId: string | string[] | undefined): string | null {
  if (!rawId) {
    return null;
  }
  const normalizedId = Array.isArray(rawId) ? rawId[0] : rawId;
  const lowercase = normalizedId.trim().toLowerCase();
  const withoutExtension = lowercase.endsWith(".svg") ? lowercase.slice(0, -4) : lowercase;
  if (!withoutExtension) {
    return null;
  }
  const safeId = withoutExtension.replace(/[^a-z0-9-]/g, "");
  if (!safeId) {
    return null;
  }
  return safeId;
}

async function loadIcon(assetId: string): Promise<IconCacheEntry> {
  const cached = iconCache.get(assetId);
  if (cached) {
    return cached;
  }

  const filePath = path.join(ICONS_DIRECTORY, `${assetId}.svg`);
  const raw = await readFile(filePath);
  const etag = `"${createHash("sha1").update(raw).digest("hex")}"`;
  const compressed = brotliCompressSync(raw, BROTLI_OPTIONS);
  const gzip = gzipSync(raw);

  const entry: IconCacheEntry = { raw, compressed, gzip, etag };
  iconCache.set(assetId, entry);
  return entry;
}

export async function GET(
  request: Request,
  context: { params: { assetId: string } }
): Promise<NextResponse> {
  const assetId = sanitizeAssetId(context.params?.assetId);
  if (!assetId) {
    return new NextResponse("Not Found", { status: 404 });
  }

  try {
    const entry = await loadIcon(assetId);
    const requestHeaders = request.headers;
    const acceptEncoding = requestHeaders.get("accept-encoding")?.toLowerCase() ?? "";
    const supportsBrotli = acceptEncoding.includes("br");
    const supportsGzip = acceptEncoding.includes("gzip");
    const ifNoneMatch = requestHeaders.get("if-none-match");

    const headers = new Headers({
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": "image/svg+xml; charset=utf-8",
      ETag: entry.etag,
      Vary: "Accept-Encoding"
    });

    if (ifNoneMatch && ifNoneMatch === entry.etag) {
      return new NextResponse(null, { status: 304, headers });
    }

    if (supportsBrotli) {
      headers.set("Content-Encoding", "br");
      headers.set("Content-Length", String(entry.compressed.length));
      return new NextResponse(entry.compressed, {
        status: 200,
        headers
      });
    }

    if (supportsGzip) {
      headers.set("Content-Encoding", "gzip");
      headers.set("Content-Length", String(entry.gzip.length));
      return new NextResponse(entry.gzip, {
        status: 200,
        headers
      });
    }

    headers.set("Content-Length", String(entry.raw.length));
    return new NextResponse(entry.raw, {
      status: 200,
      headers
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code !== "ENOENT") {
      console.error(`Failed to load tech stack icon "${context.params?.assetId}":`, error);
    }
    return new NextResponse("Not Found", { status: 404 });
  }
}
