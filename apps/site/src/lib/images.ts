export type ImageDescriptor = {
  /** Public path or remote URL pointing at the asset. */
  src: string;
  /** Alternative text describing the visual. */
  alt: string;
  /** Source width in pixels (required by next/image). */
  width: number;
  /** Source height in pixels (required by next/image). */
  height: number;
  /** Optional low-quality image placeholder (base64). */
  blurDataURL?: string;
};

export type ResponsiveImagePreset = "hero" | "content" | "inline";

/**
 * Sizes hints tuned to key layout contexts. These map to Tailwind breakpoints
 * and keep the browser in charge of selecting the best candidate from the
 * generated srcset.
 */
export const RESPONSIVE_IMAGE_SIZES: Record<ResponsiveImagePreset, string> = {
  hero: "(max-width: 1023px) 100vw, (max-width: 1279px) 60vw, 560px",
  content: "(max-width: 1023px) 100vw, (max-width: 1439px) 720px, 780px",
  inline: "(max-width: 639px) 90vw, 360px"
};

/**
 * Centralised quality defaults that can be shared across the site to ensure we
 * consistently hit Core Web Vitals without manually tuning every <Image>.
 */
export const DEFAULT_IMAGE_QUALITY = 82;
