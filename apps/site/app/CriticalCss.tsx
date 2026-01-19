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
  routes?: Record<string, RouteEntry>;
  shared?: RouteEntry | null;
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

const sharedEntry = manifest.shared?.cssBase64
  ? {
      id: manifest.shared.id,
      bytes: manifest.shared.bytes,
      kilobytes: manifest.shared.kilobytes,
      css: Buffer.from(manifest.shared.cssBase64, "base64").toString("utf8")
    }
  : null;
const defaultEntry =
  sharedEntry ?? decodedRoutes.values().next().value ?? null;

export function CriticalCss({
  route,
  nonce
}: {
  route?: string;
  nonce?: string;
}) {
  const selected =
    (route ? decodedRoutes.get(route) : undefined) ?? defaultEntry;

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
