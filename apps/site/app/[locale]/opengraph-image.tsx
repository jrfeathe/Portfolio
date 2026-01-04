import { getDictionary } from "../../src/utils/dictionaries";
import { defaultLocale, isLocale } from "../../src/utils/i18n";
import {
  buildOgImage,
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE
} from "../../src/lib/seo/opengraph";

export const runtime = "edge";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

type ImageProps = {
  params: {
    locale: string;
  };
};

function resolveLocale(value: string) {
  return isLocale(value) ? value : defaultLocale;
}

export default function Image({ params }: ImageProps) {
  const locale = resolveLocale(params.locale);
  const dictionary = getDictionary(locale);

  return buildOgImage({
    kicker: dictionary.metadata.title,
    title: dictionary.home.breadcrumbs.home,
    description: dictionary.metadata.description
  });
}
