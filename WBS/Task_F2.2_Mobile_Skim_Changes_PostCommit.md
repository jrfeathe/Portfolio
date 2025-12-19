# Mobile Skim changes since f2ef28f6 (Task F2.2 baseline)

- **Context:** Baseline commit `f2ef28f69db5786b8f9ea0f61d22ab8a181c3df4` implemented desktop skim. Subsequent work layered mobile behavior directly on the shared layout/data, causing desktop regressions (e.g., gaps and reordering). This file captures the post-commit changes and their disposition.

## Changes made after the baseline (code deltas)
- `apps/site/src/components/Shell/MobileShellLayout.tsx`
  - Added `buildFallbackNavItems` to rebuild nav items from sections when `anchorItems` is empty (skim mobile) and avoided showing menu when only `#skim-summary` exists (`isSkimSummaryOnly`, `menuEnabled`).
  - Added mobile-nav skim toggle (`shouldShowNavSkimToggle`) and hid header toggle when nav/menu drives skim controls (`shouldShowSkimToggle` logic).
  - CTA/email: kept sticky CTA for full layout, but for skim mobile rendered CTA after main content (`shouldRenderAfterContentCta`) and skipped header CTA when skim.
  - Moved skim email card stays in sidebar only in skim mode.
  - Header adjustments for skim mobile: tighter padding (`pb-1 pt-2` -> `pb-1 pt-1` -> reverted to shared, then headerStackSpacing/titleStackSpacing tweaked; latest diff sets `headerStackSpacing="space-y-4"`, `titleStackSpacing="space-y-2"`, content padding `pt-0 pb-4` in skim).
  - Skim title sizes responsive in MobileShellLayout: down to `text-base leading-snug` when `skimModeEnabled`.
  - Menu gating: menu button/overlay keyed off `menuEnabled` (nav present or skim-summary-only).
  - Nav rendering: anchor list hidden when only skim-summary exists; otherwise rendered with expand/collapse controls; skim toggle added inside menu controls.
  - Content padding: skim mobile uses `pt-0 pb-4` vs `py-4` default.

- `apps/site/app/[locale]/page.tsx`
  - Skim summary now renders two breakpoint-specific blocks:
    - Desktop (`hidden md:grid md:grid-cols-2`): original layout restored (summary w/ timezone, tech stack, availability).
    - Mobile (`md:hidden`): smaller centered title (`text-lg`), summary cards excluding timezone, then tech stack, timezone, availability.
  - Shared data (`summaryItems`, tech stack items) reused for both; mobile omits timezone from summary and re-adds as its own card.
  - Previous intermediate changes (now superseded): centered and downsized skim title on mobile, reordering of cards (tech stack → timezone → availability), attempts at responsive reordering that impacted desktop, negative margins to close gaps—replaced by the split layout above.

## Issues observed
- Desktop skim was affected by mobile ordering/gaps when both shared a single layout tree; responsive ordering created blank space on desktop.
- Timezone placement and spacing regressed during intermediate responsive experiments.

## New direction implemented
- Base data remains shared; rendering is split into explicit mobile and desktop fragments to prevent cross-impact.
- Desktop uses the original F2.2 layout unchanged; mobile uses its bespoke order/spacing.

## Follow-ups
- Verify skim mode on mobile/desktop matches expectations.
- If further changes are needed, consider extracting a typed “skim summary data” helper consumed by two view components to reduce risk.

## Issues observed
- Desktop skim inherited mobile-only layout tweaks (timezone placement/gaps) because both layouts shared the same rendered content structure.
- Reordering/timezone duplication logic created layout gaps on desktop.

## New direction implemented
- Reintroduced a shared base data source for skim (`buildSkimSections`), then rendered *separate* mobile and desktop skim blocks:
  - Mobile: smaller centered title, summary cards without timezone, then tech stack, timezone, availability.
  - Desktop: original two-column layout from the baseline (summary including timezone on the left; tech stack + availability on the right).
- Layouts are now split by breakpoint (`md:hidden` vs `hidden md:grid`), so mobile changes no longer alter desktop.

## Follow-ups
- Verify skim mode on both mobile and desktop for layout parity with baseline desktop and the requested mobile ordering.
- Consider extracting shared skim data into a typed helper if further divergence is needed.

## Full code diff vs baseline (f2ef28f6)

### apps/site/app/[locale]/page.tsx
```diff
@@
 const summaryItems = [
@@
-  return [
-    {
-      id: "skim-summary",
-      title: "",
-      content: (
-        <div className="grid gap-3 md:grid-cols-2">
-          <div className="grid gap-3">
-            <h1 className="pl-4 pt-0 text-2xl font-semibold leading-tight tracking-tight text-text dark:text-dark-text md:text-3xl">
-              {skim.columnTitle}
-            </h1>
-            {summaryItems.map((item, index) => (
-              <div
-                key={item.id}
-                className={clsx(
-                  "skim-card rounded-xl border border-border/70 bg-surface px-4 py-3 dark:border-dark-border/70 dark:bg-dark-surface",
-                  index === 0 && "-mt-0"
-                )}
-              >
-                <p className="text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
-                  {item.label}
-                </p>
-                {item.href ? (
-                  item.href.startsWith("http") || item.href.startsWith("mailto:") ? (
-                    <a
-                      href={item.href}
-                      className="mt-1 inline-flex text-base font-semibold text-accent underline-offset-4 hover:underline dark:text-dark-accent"
-                    >
-                      {item.value}
-                    </a>
-                  ) : (
-                    <Link
-                      href={item.href}
-                      className="mt-1 inline-flex text-base font-semibold text-accent underline-offset-4 hover:underline dark:text-dark-accent"
-                    >
-                      {item.value}
-                    </Link>
-                  )
-                ) : (
-                  <p className="mt-1 text-base leading-relaxed">{item.value}</p>
-                )}
-              </div>
-            ))}
-          </div>
-          <div className="grid gap-3">
-            <div className="skim-card rounded-xl border border-border/70 bg-surface px-4 py-3 dark:border-dark-border/70 dark:bg-dark-surface">
-              <p className="text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
-                {skim.techStackTitle}
-              </p>
-              <TechStackCarousel items={techStackItems} />
-            </div>
-            <div className="skim-card rounded-xl border border-border/70 bg-surface px-4 py-3 dark:border-dark-border/70 dark:bg-dark-surface">
-              <p className="text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
-                {skim.availabilityLabel}
-              </p>
-              <p className="mt-1 text-base leading-relaxed">{skim.availability}</p>
-            </div>
-          </div>
-        </div>
-      )
-    }
-  ];
+  const mobileSummaryItems = summaryItems.filter((item) => item.id !== "timezone");
+  const mobileTimezoneItem = summaryItems.find((item) => item.id === "timezone");
+
+  return [
+    {
+      id: "skim-summary",
+      title: "",
+      content: (
+        <>
+          <div className="grid gap-3 md:hidden">
+            <div className="grid gap-3">
+              <h1 className="pt-0 text-lg font-semibold leading-tight tracking-tight text-text dark:text-dark-text text-center px-4">
+                {skim.columnTitle}
+              </h1>
+              {mobileSummaryItems.map((item, index) => (
+                <div
+                  key={item.id}
+                  className={clsx(
+                    "skim-card rounded-xl border border-border/70 bg-surface px-4 py-3 dark:border-dark-border/70 dark:bg-dark-surface",
+                    index === 0 && "-mt-0"
+                  )}
+                >
+                  <p className="text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
+                    {item.label}
+                  </p>
+                  {item.href ? (
+                    item.href.startsWith("http") || item.href.startsWith("mailto:") ? (
+                      <a
+                        href={item.href}
+                        className="mt-1 inline-flex text-base font-semibold text-accent underline-offset-4 hover:underline dark:text-dark-accent"
+                      >
+                        {item.value}
+                      </a>
+                    ) : (
+                      <Link
+                        href={item.href}
+                        className="mt-1 inline-flex text-base font-semibold text-accent underline-offset-4 hover:underline dark:text-dark-accent"
+                      >
+                        {item.value}
+                      </Link>
+                    )
+                  ) : (
+                    <p className="mt-1 text-base leading-relaxed">{item.value}</p>
+                  )}
+                </div>
+              ))}
+            </div>
+            <div className="skim-card rounded-xl border border-border/70 bg-surface px-4 py-3 dark:border-dark-border/70 dark:bg-dark-surface">
+              <p className="text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
+                {skim.techStackTitle}
+              </p>
+              <TechStackCarousel items={techStackItems} />
+            </div>
+            {mobileTimezoneItem ? (
+              <div className="skim-card rounded-xl border border-border/70 bg-surface px-4 py-3 dark:border-dark-border/70 dark:bg-dark-surface">
+                <p className="text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
+                  {mobileTimezoneItem.label}
+                </p>
+                {mobileTimezoneItem.href ? (
+                  mobileTimezoneItem.href.startsWith("http") || mobileTimezoneItem.href.startsWith("mailto:") ? (
+                    <a
+                      href={mobileTimezoneItem.href}
+                      className="mt-1 inline-flex text-base font-semibold text-accent underline-offset-4 hover:underline dark:text-dark-accent"
+                    >
+                      {mobileTimezoneItem.value}
+                    </a>
+                  ) : (
+                    <Link
+                      href={mobileTimezoneItem.href}
+                      className="mt-1 inline-flex text-base font-semibold text-accent underline-offset-4 hover:underline dark:text-dark-accent"
+                    >
+                      {mobileTimezoneItem.value}
+                    </Link>
+                  )
+                ) : (
+                  <p className="mt-1 text-base leading-relaxed">{mobileTimezoneItem.value}</p>
+                )}
+              </div>
+            ) : null}
+            <div className="skim-card rounded-xl border border-border/70 bg-surface px-4 py-3 dark:border-dark-border/70 dark:bg-dark-surface">
+              <p className="text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
+                {skim.availabilityLabel}
+              </p>
+              <p className="mt-1 text-base leading-relaxed">{skim.availability}</p>
+            </div>
+          </div>
+
+          <div className="hidden md:grid md:grid-cols-2 gap-3">
+            <div className="grid gap-3">
+              <h1 className="pl-4 pt-0 text-2xl font-semibold leading-tight tracking-tight text-text dark:text-dark-text md:text-3xl">
+                {skim.columnTitle}
+              </h1>
+              {summaryItems.map((item, index) => (
+                <div
+                  key={item.id}
+                  className={clsx(
+                    "skim-card rounded-xl border border-border/70 bg-surface px-4 py-3 dark:border-dark-border/70 dark:bg-dark-surface",
+                    index === 0 && "-mt-0"
+                  )}
+                >
+                  <p className="text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
+                    {item.label}
+                  </p>
+                  {item.href ? (
+                    item.href.startsWith("http") || item.href.startsWith("mailto:") ? (
+                      <a
+                        href={item.href}
+                        className="mt-1 inline-flex text-base font-semibold text-accent underline-offset-4 hover:underline dark:text-dark-accent"
+                      >
+                        {item.value}
+                      </a>
+                    ) : (
+                      <Link
+                        href={item.href}
+                        className="mt-1 inline-flex text-base font-semibold text-accent underline-offset-4 hover:underline dark:text-dark-accent"
+                      >
+                        {item.value}
+                      </Link>
+                    )
+                  ) : (
+                    <p className="mt-1 text-base leading-relaxed">{item.value}</p>
+                  )}
+                </div>
+              ))}
+            </div>
+            <div className="grid gap-3">
+              <div className="skim-card rounded-xl border border-border/70 bg-surface px-4 py-3 dark:border-dark-border/70 dark:bg-dark-surface">
+                <p className="text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
+                  {skim.techStackTitle}
+                </p>
+                <TechStackCarousel items={techStackItems} />
+              </div>
+              <div className="skim-card rounded-xl border border-border/70 bg-surface px-4 py-3 dark:border-dark-border/70 dark:bg-dark-surface">
+                <p className="text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
+                  {skim.availabilityLabel}
+                </p>
+                <p className="mt-1 text-base leading-relaxed">{skim.availability}</p>
+              </div>
+            </div>
+          </div>
+        </>
+      )
+    }
+  ];
```

### apps/site/src/components/Shell/MobileShellLayout.tsx
```diff
@@
-  const navItems: AnchorNavItem[] =
-    anchorItems ??
-    sections.map((section) => ({
-      label: typeof section.title === "string" ? section.title : section.id,
-      href: `#${section.id}`
-    }));
+  const buildFallbackNavItems = () =>
+    sections.map((section) => ({
+      label:
+        typeof section.title === "string" && section.title.trim().length > 0
+          ? section.title
+          : section.id,
+      href: `#${section.id}`
+    }));
+  const rawNavItems: AnchorNavItem[] =
+    anchorItems?.length
+      ? anchorItems
+      : skimModeEnabled && Array.isArray(anchorItems)
+        ? buildFallbackNavItems()
+        : anchorItems ?? buildFallbackNavItems();
   const [menuOpen, setMenuOpen] = useState(false);
   const [menuButtonTop, setMenuButtonTop] = useState<number | undefined>(undefined);
   const languageSwitcherRef = useRef<HTMLDivElement | null>(null);
-  const hasNestedAnchors = navItems.some((item) => item.children?.length);
-  const hasNavItems = navItems.length > 0;
+  const isSkimSummaryOnly =
+    skimModeEnabled &&
+    rawNavItems.length === 1 &&
+    rawNavItems[0]?.href === "#skim-summary" &&
+    !rawNavItems[0]?.children?.length;
+  const navItems = isSkimSummaryOnly ? [] : rawNavItems;
+  const hasNestedAnchors = navItems.some((item) => item.children?.length);
+  const hasNavItems = navItems.length > 0;
+  const menuEnabled = hasNavItems || isSkimSummaryOnly;
+  const shouldShowSkimToggle = showSkimToggle && (!skimModeEnabled || !menuEnabled);
+  const shouldShowNavSkimToggle = showSkimToggle && skimModeEnabled && menuEnabled;
+  const shouldRenderHeaderCta = !!cta && !skimModeEnabled;
+  const shouldRenderAfterContentCta = !!cta && skimModeEnabled;
@@
-      {menuOpen && hasNavItems ? (
+      {menuOpen && menuEnabled ? (
         <div className="fixed inset-0 z-50 flex">
@@
-            {navItems.length ? (
+            {menuEnabled ? (
               <div className="flex min-h-0 flex-1 flex-col gap-3">
                 <div className="space-y-4">
                   <ThemeToggle locale={locale} />
                   <ContrastToggle locale={locale} />
+                  {shouldShowNavSkimToggle ? (
+                    <SkimToggleButton
+                      active={skimModeEnabled}
+                      locale={locale}
+                      className="w-full justify-center"
+                    />
+                  ) : null}
@@
-                <div className="min-h-0 flex-1 overflow-y-auto">
-                  <AnchorNav
-                    items={navItems}
-                    orientation="vertical"
-                    scrollable={false}
-                  />
-                </div>
+                {navItems.length ? (
+                  <div className="min-h-0 flex-1 overflow-y-auto">
+                    <AnchorNav
+                      items={navItems}
+                      orientation="vertical"
+                      scrollable={false}
+                    />
+                  </div>
+                ) : null}
@@
-      {!menuOpen && hasNavItems ? (
+      {!menuOpen && menuEnabled ? (
         <button
@@
-            <div className="space-y-2">
-              <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
+            <div className="space-y-2">
+              <h1
+                className={clsx(
+                  "font-semibold tracking-tight",
+                  skimModeEnabled ? "text-base leading-snug" : "text-3xl"
+                )}
+              >
+                {title}
+              </h1>
@@
-            {showSkimToggle ? (
+            {shouldShowSkimToggle ? (
               <SkimToggleButton active={skimModeEnabled} locale={locale} />
             ) : null}
@@
-            {cta ? (
+            {shouldRenderHeaderCta ? (
               <>
                 {cta}
               </>
             ) : null}
@@
-          "mx-auto w-full max-w-6xl px-4 py-4",
+          "mx-auto w-full max-w-6xl px-4",
+          skimModeEnabled ? "pt-2 pb-4" : "py-4",
           className
         )}
       >
@@
         </main>
+        {shouldRenderAfterContentCta ? (
+          <div className="mt-6 space-y-4">
+            {cta}
+          </div>
+        ) : null}
```
