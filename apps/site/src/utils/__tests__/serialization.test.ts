import { escapeJsonForHtml } from "../serialization";

describe("escapeJsonForHtml", () => {
  it("escapes characters that could break out of a script tag", () => {
    const unsafe = '</script><script>{"note":"line break \u2028\u2029"}</script>';
    const escaped = escapeJsonForHtml(unsafe);

    expect(escaped).toBe(
      "\\u003C\\u002Fscript\\u003E\\u003Cscript\\u003E{\"note\":\"line break \\u2028\\u2029\"}\\u003C\\u002Fscript\\u003E"
    );
  });

  it("returns safe JSON unchanged", () => {
    const safe = '{"name":"jack","status":"ok"}';
    expect(escapeJsonForHtml(safe)).toBe(safe);
  });

  it("falls back to the original character when lookup misses", () => {
    const originalReplace = String.prototype.replace;
    const replaceSpy = jest.fn(function (
      this: string,
      pattern: RegExp,
      replacer: (substring: string, ...args: unknown[]) => string
    ) {
      void pattern;
      return replacer("?");
    });

    // @ts-expect-error - override built-in method for a focused branch test
    String.prototype.replace = replaceSpy as typeof String.prototype.replace;

    try {
      expect(escapeJsonForHtml("noop")).toBe("?");
    } finally {
      String.prototype.replace = originalReplace;
    }
  });
});
