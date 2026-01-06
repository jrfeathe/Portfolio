import Image from "next/image";
import clsx from "clsx";

import { FOCUS_VISIBLE_RING } from "@portfolio/ui";

type SocialLinksProps = {
  className?: string;
  iconClassName?: string;
  size?: "sm" | "md" | "lg";
};

const ICON_SIZE_PX = {
  sm: 20,
  md: 24,
  lg: 28
} as const;

const ICON_SIZE_CLASS = {
  sm: "h-5 w-5",
  md: "h-6 w-6",
  lg: "h-7 w-7"
} as const;

const LINK_CLASS_NAME = `${FOCUS_VISIBLE_RING} inline-flex items-center justify-center leading-none text-text transition hover:opacity-80 dark:text-dark-text`;

export function SocialLinks({
  className,
  iconClassName,
  size = "md"
}: SocialLinksProps) {
  const iconSize = ICON_SIZE_PX[size];
  const iconClasses = clsx(ICON_SIZE_CLASS[size], iconClassName);

  return (
    <div
      data-social-links
      className={clsx("flex items-center gap-4", className)}
    >
      <a
        href="https://linkedin.com/in/jrfeathe"
        className={LINK_CLASS_NAME}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="LinkedIn"
      >
        <Image
          src="/tech-stack/linkedin.svg"
          alt=""
          width={iconSize}
          height={iconSize}
          className={iconClasses}
          unoptimized
        />
      </a>
      <a
        href="https://github.com/jrfeathe"
        className={LINK_CLASS_NAME}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="GitHub"
      >
        <span className="block dark:hidden" aria-hidden>
          <Image
            src="/tech-stack/github.svg"
            alt=""
            width={iconSize}
            height={iconSize}
            className={iconClasses}
            unoptimized
          />
        </span>
        <span className="hidden dark:block" aria-hidden>
          <Image
            src="/tech-stack/github2.svg"
            alt=""
            width={iconSize}
            height={iconSize}
            className={iconClasses}
            unoptimized
          />
        </span>
      </a>
    </div>
  );
}
