import type { JsonLdPayload } from "../../lib/seo/jsonld";
import { escapeJsonForHtml } from "../../utils/serialization";

type StructuredDataProps = {
  data: JsonLdPayload;
};

export function StructuredData({ data }: StructuredDataProps) {
  const payload = escapeJsonForHtml(JSON.stringify(data));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: payload }}
    />
  );
}
