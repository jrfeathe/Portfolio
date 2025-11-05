import { Buffer } from "node:buffer";

import manifestJson from "./critical-css.manifest.json";

type RouteEntry = {
  id: string;
  bytes: number;
  kilobytes: number;
  cssBase64: string;
};

export type CriticalCssManifest = {
  version: number;
  generatedAt: string;
  routes: Record<string, RouteEntry>;
  combined?: {
    bytes: number;
    kilobytes: number;
    cssBase64: string;
  };
};

const manifest = manifestJson as CriticalCssManifest;

type DecodedEntry = {
  id: string;
  bytes: number;
  kilobytes: number;
  css: string;
};

const decodedRoutes = new Map<string, DecodedEntry>();

for (const [route, entry] of Object.entries(manifest.routes ?? {})) {
  if (!entry?.cssBase64) {
    continue;
  }

  decodedRoutes.set(route, {
    id: entry.id,
    bytes: entry.bytes,
    kilobytes: entry.kilobytes,
    css: Buffer.from(entry.cssBase64, "base64").toString("utf8")
  });
}

const combinedEntry = manifest.combined?.cssBase64
  ? {
      id: "combined",
      bytes: manifest.combined.bytes,
      kilobytes: manifest.combined.kilobytes,
      css: Buffer.from(manifest.combined.cssBase64, "base64").toString("utf8")
    }
  : null;

export function CriticalCss({
  route,
  nonce
}: {
  route?: string;
  nonce?: string;
}) {
  const selected =
    (route ? decodedRoutes.get(route) : undefined) ?? combinedEntry;

  if (!selected?.css) {
    return null;
  }

  return (
    <style
      suppressHydrationWarning
      data-critical-css={selected.id}
      data-critical-bytes={selected.bytes}
      data-critical-kb={selected.kilobytes}
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: selected.css }}
    />
  );
}
