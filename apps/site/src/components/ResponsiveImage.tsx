import Image from "next/image";
import clsx from "clsx";

import {
  DEFAULT_IMAGE_QUALITY,
  type ImageDescriptor,
  RESPONSIVE_IMAGE_SIZES,
  type ResponsiveImagePreset
} from "../lib/images";

export type ResponsiveImageProps = {
  image: ImageDescriptor;
  /**
   * Layout preset that maps to a `sizes` string. Consumers can override via the
   * `sizes` prop when custom breakpoints are required.
   */
  preset?: ResponsiveImagePreset;
  /** Force eager loading for above-the-fold imagery. */
  priority?: boolean;
  /** Optional className forwarded to the underlying <Image>. */
  className?: string;
  /**
   * Custom `sizes` attribute. When omitted, the preset is used. Providing a
   * value here automatically disables the preset behaviour.
   */
  sizes?: string;
  /**
    * Optional flag to tell `next/image` to use layout `fill`. When true the
    * caller must provide appropriate container sizing styles.
    */
  fill?: boolean;
};

const DEFAULT_PRESET: ResponsiveImagePreset = "content";

export function ResponsiveImage({
  image,
  preset = DEFAULT_PRESET,
  priority = false,
  className,
  sizes,
  fill = false
}: ResponsiveImageProps) {
  const placeholder =
    typeof image.blurDataURL === "string" ? "blur" : "empty";

  return (
    <Image
      alt={image.alt}
      src={image.src}
      width={fill ? undefined : image.width}
      height={fill ? undefined : image.height}
      quality={DEFAULT_IMAGE_QUALITY}
      placeholder={placeholder}
      blurDataURL={image.blurDataURL}
      priority={priority}
      loading={priority ? "eager" : "lazy"}
      sizes={sizes ?? RESPONSIVE_IMAGE_SIZES[preset]}
      className={clsx(
        "rounded-xl border border-border/40 bg-surface object-cover dark:border-dark-border/40 dark:bg-dark-surface",
        fill ? "h-full w-full" : "max-w-full",
        className
      )}
      fill={fill}
    />
  );
}
