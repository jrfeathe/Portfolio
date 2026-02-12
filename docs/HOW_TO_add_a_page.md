# How To Add A Page (App Router + Three-Pane Shell)

This guide documents the exact steps for adding a new localized page in this
repo. It captures the approach used for `/[locale]/services` so we can repeat
it quickly and consistently.

## 1) Decide The Route And Behavior

- Choose the localized route: `/[locale]/your-page`.
- Decide if a non-localized redirect is needed at `/your-page`.
- Decide whether the page should appear in navigation or remain isolated.
- Decide if it should be in the sitemap.

## 2) Add Dictionary Copy

All page copy comes from the dictionary in
`apps/site/src/utils/dictionaries.ts`. Each locale must provide the same shape.

Steps:

1. Add a new type (if needed) to keep copy structured.
2. Extend `AppDictionary` with a new `yourPage` section.
3. Add content for each locale (`en`, `ja`, `zh`) under the same key.

Example (structure):

- `metadataTitle`, `title`, `subtitle` for metadata and hero.
- Section titles, subtitles, lists, and CTA copy.

Tip: Keep headings in Title Case and use sentence case for body copy.

## 3) Create The Localized Page

Create `apps/site/app/[locale]/your-page/page.tsx` and follow the
Shell layout pattern used by `meetings` or `experience`.

Required elements:

- `generateStaticParams()` using `locales`.
- `generateMetadata()` with `alternates.languages`, Open Graph, and canonical.
- `ResponsiveShellLayout` with:
  - `sections` from your dictionary copy.
  - `floatingWidget` with `ResponsiveAudioPlayer`.
  - `cta` using `StickyCTA`.
  - `showSkimToggle={false}` if skim mode is not required.
  - `shellCopy={dictionary.shell}` and `footerContent={dictionary.home.footer}`.

Audio continuity is preserved by `ResponsiveAudioPlayer` which uses a shared
audio element in `apps/site/src/components/AudioPlayer.tsx`.
Use `next/link` for internal navigation (avoid raw `<a>` tags for in-app routes),
otherwise the browser may do a full reload and reset the audio player.

## 4) Add The Open Graph Image Route

Create `apps/site/app/[locale]/your-page/opengraph-image.tsx`:

- Use `buildOgImage` from `src/lib/seo/opengraph`.
- Pull copy from `dictionary.yourPage`.
- Match the pattern used by `/experience` or `/meetings`.

## 5) Add The Non-Localized Redirect (Optional)

If you want `/your-page` to redirect to `/en/your-page`, add:

`apps/site/app/your-page/page.tsx`

Use the same pattern as `apps/site/app/meetings/page.tsx`:

- `redirect("/en/your-page")`

## 6) Add To Sitemap (Optional)

Update `apps/site/app/sitemap.ts`:

- Create language alternates for `/your-page`.
- Add a sitemap entry per locale.

Match the change frequency/priority to the page type.

## 7) Keep The Page Isolated (Optional)

If the page should not be linked yet:

- Do not add it to nav items or CTAs.
- Keep it out of UI links.
- It can still exist in the sitemap if you want search engines to see it.

## 8) Sanity Checks

- Confirm the dictionary compiles for all locales.
- Confirm page loads at `/en/your-page`.
- Confirm `/your-page` redirect (if added).
- Confirm OG image renders.
- Confirm audio continues across navigation.

## Files Touched For `/services`

- `apps/site/src/utils/dictionaries.ts`
- `apps/site/app/[locale]/services/page.tsx`
- `apps/site/app/[locale]/services/opengraph-image.tsx`
- `apps/site/app/services/page.tsx`
- `apps/site/app/sitemap.ts`
