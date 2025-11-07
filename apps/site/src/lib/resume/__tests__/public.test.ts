import { getPublicResume } from "../public";

describe("getPublicResume", () => {
  it("returns a sanitized public resume without placeholders", () => {
    const resume = getPublicResume();
    const serialized = JSON.stringify(resume);

    expect(resume.version).toBeDefined();
    expect(resume.profile.name).toBe("Jack R. Featherstone");
    expect(resume.profile.sameAs).toEqual(
      expect.arrayContaining([
        "https://github.com/jrfeathe",
        "https://linkedin.com/in/jrfeathe"
      ])
    );
    expect(resume.downloads.pdf).toBe("/resume.pdf");
    expect(resume.downloads.json).toBe("/resume.json");
    expect(serialized).not.toContain("PLACEHOLDER");
  });

  it("caches the resume instance between calls", () => {
    const first = getPublicResume();
    const second = getPublicResume();

    expect(second).toBe(first);
  });
});
