import { render } from "@testing-library/react";

import { StructuredData } from "../../../components/seo/StructuredData";
import { getDictionary } from "../../../utils/dictionaries";
import { getResumeProfile } from "../../resume/profile";
import {
  buildHomePageJsonLd,
  buildNotesIndexJsonLd,
  buildNoteDetailJsonLd,
  type JsonLdPayload
} from "../jsonld";

describe("structured data generators", () => {
  const profile = getResumeProfile();
  const dictionary = getDictionary("en");

  test("resume profile exposes sanitized public fields", () => {
    expect(profile.location.region).toBe("Upstate New York");
    expect(profile.sameAs).toEqual(
      expect.arrayContaining([
        "https://github.com/jrfeathe",
        "https://linkedin.com/in/jrfeathe",
        "https://placeholder.onion"
      ])
    );
  });

  test("home page graph includes person, website, and breadcrumbs", () => {
    const payload = buildHomePageJsonLd({
      locale: "en",
      dictionary,
      profile
    });

    const types = payload["@graph"].flatMap((entry) => {
      const value = entry["@type"];
      if (Array.isArray(value)) {
        return value;
      }
      return value ? [value] : [];
    });

    expect(types).toEqual(
      expect.arrayContaining(["Person", "WebSite", "WebPage", "BreadcrumbList"])
    );
  });

  test("notes index graph models the collection page", () => {
    const payload = buildNotesIndexJsonLd({
      locale: "en",
      dictionary
    });

    const collectionNode = payload["@graph"].find((entry) => {
      const type = entry["@type"];
      return Array.isArray(type) && type.includes("CollectionPage");
    });

    expect(collectionNode).toBeDefined();
  });

  test("note detail graph supports multiple authors", () => {
    const payload = buildNoteDetailJsonLd({
      locale: "en",
      dictionary,
      profile,
      note: {
        slug: "mdx-pipeline",
        frontmatter: {
          title: "MDX pipeline game plan",
          summary: "Summary",
          publishedAt: "2025-10-27",
          tags: ["architecture"],
          authors: ["Jack R. Featherstone", "Other Contributor"]
        }
      }
    });

    const articleNode = payload["@graph"].find((entry) => entry["@type"] === "Article") as
      | Record<string, unknown>
      | undefined;
    expect(articleNode).toBeDefined();
    const authors = Array.isArray(articleNode?.author)
      ? (articleNode?.author as unknown[])
      : [];
    expect(authors).toHaveLength(2);
  });
});

describe("<StructuredData />", () => {
  test("renders a CSP-compliant script block", () => {
    const data: JsonLdPayload = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          name: "<script>"
        }
      ]
    };

    const { container } = render(
      <StructuredData
        data={data}
        nonce="test-nonce"
      />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    expect(script?.getAttribute("nonce")).toBe("test-nonce");
    expect(script?.innerHTML).toContain("\\u003Cscript");
  });
});
