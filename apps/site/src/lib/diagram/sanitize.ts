const UNSAFE_SVG_PATTERN =
  /<\s*(script|iframe|embed|object|form|link|meta|style)[^>]*>|javascript:/i;

export function validateSvg(svg: string) {
  if (!svg.trim().startsWith("<svg")) {
    throw new Error("Response is not valid SVG.");
  }

  if (UNSAFE_SVG_PATTERN.test(svg)) {
    throw new Error("SVG contains disallowed elements or scripts.");
  }

  return svg;
}
