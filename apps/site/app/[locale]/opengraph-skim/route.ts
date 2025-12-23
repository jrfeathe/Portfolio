import { getDictionary } from "../../../src/utils/dictionaries";
import { defaultLocale, isLocale } from "../../../src/utils/i18n";
import { buildOgImage } from "../../../src/lib/seo/opengraph";

export const runtime = "edge";

type RouteContext = {
  params: {
    locale: string;
  };
};

function resolveLocale(value: string) {
  return isLocale(value) ? value : defaultLocale;
}

export function GET(_request: Request, { params }: RouteContext) {
  const locale = resolveLocale(params.locale);
  const dictionary = getDictionary(locale);
  const skimLabel = dictionary.skimToggle.buttonLabelOn;

  return buildOgImage({
    kicker: dictionary.metadata.title,
    title: `${dictionary.home.breadcrumbs.home} • ${skimLabel}`,
    description: dictionary.metadata.description
  });
}
