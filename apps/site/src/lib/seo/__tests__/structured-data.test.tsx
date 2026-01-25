import { render } from "@testing-library/react";

import { StructuredData } from "../../../components/seo/StructuredData";
import { getDictionary } from "../../../utils/dictionaries";
import { getResumeProfile } from "../../resume/profile";
import {
  buildHomePageJsonLd,
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
        "https://linkedin.com/in/jrfeathe"
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

});

describe("<StructuredData />", () => {
  test("renders a JSON-LD script block", () => {
    const data: JsonLdPayload = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          name: "<script>"
        }
      ]
    };

    const { container } = render(<StructuredData data={data} />);

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    expect(script?.innerHTML).toContain("\\u003Cscript");
  });
});
