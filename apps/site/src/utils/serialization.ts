const DANGEROUS_CHARS_REGEX = /[<>/\u2028\u2029]/g;

const ESCAPE_LOOKUP: Record<string, string> = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};

/**
 * Escapes characters that could prematurely terminate a <script> tag when JSON
 * is embedded via `dangerouslySetInnerHTML`.
 */
export function escapeJsonForHtml(unsafeJson: string): string {
  return unsafeJson.replace(DANGEROUS_CHARS_REGEX, (char) => ESCAPE_LOOKUP[char] ?? char);
}

