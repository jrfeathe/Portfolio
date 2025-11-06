/**
 * @jest-environment node
 */
import { GET } from "../../app/resume.json/route";
import { getPublicResume } from "../lib/resume/public";

describe("/resume.json route", () => {
  it("returns the sanitized resume payload with caching headers", async () => {
    const response = await GET();
    const json = await response.json();
    const resume = getPublicResume();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(response.headers.get("cache-control")).toBe(
      "public, max-age=3600, stale-while-revalidate=86400"
    );
    expect(response.headers.get("etag")).toMatch(/^W\/"resume-json-/);
    expect(response.headers.get("content-length")).not.toBeNull();

    if (resume.lastModified) {
      expect(response.headers.get("last-modified")).toBe(
        new Date(`${resume.lastModified}T00:00:00Z`).toUTCString()
      );
    }

    expect(json.version).toBe(resume.version);
    expect(json.profile.sameAs).toEqual(resume.profile.sameAs);
    expect(JSON.stringify(json)).not.toContain("PLACEHOLDER");
  });
});
