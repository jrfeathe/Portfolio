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
});
