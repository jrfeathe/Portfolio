import { headers as getHeaders } from "next/headers";
import type { JsonLdPayload } from "../../lib/seo/jsonld";
import { extractNonceFromHeaders, getRequestNonce } from "../../utils/csp";
import { escapeJsonForHtml } from "../../utils/serialization";

type StructuredDataProps = {
  data: JsonLdPayload;
  nonce?: string;
};

export function StructuredData({ data, nonce }: StructuredDataProps) {
  let resolvedNonce = nonce ?? getRequestNonce();
  if (!resolvedNonce) {
    resolvedNonce = undefined;
  }

  if (!resolvedNonce && typeof window === "undefined") {
    try {
      resolvedNonce = extractNonceFromHeaders(getHeaders());
    } catch {
      resolvedNonce = undefined;
    }
    if (!resolvedNonce) {
      resolvedNonce = undefined;
    }
  }

  const payload = escapeJsonForHtml(JSON.stringify(data));

  return (
    <script
      suppressHydrationWarning
      type="application/ld+json"
      nonce={resolvedNonce}
      dangerouslySetInnerHTML={{ __html: payload }}
    />
  );
}
