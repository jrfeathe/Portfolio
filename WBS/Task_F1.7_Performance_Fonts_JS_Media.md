## Task F1.7 — Performance for Fonts, JS, Media

### Goals

* Reduce **initial transfer** and **JS parse/execute** cost on the main page.
* Cut **font payload** (especially number of files + TTF usage).
* Ensure everything heavy is **on-demand / viewport-lazy** (already doing this for the tech-stack-carousel).

### Non-goals

* Reworking all UI/visual design.
* Pixel-perfect parity after aggressive trimming (we prioritize load speed).

---

## A. Fonts: move to WOFF2, reduce weights, subset by locale

### A1) Stop serving TTF to browsers (WOFF2-only)

**Target outcome**

* Fonts are served as **.woff2** (and ideally only .woff2).
* Number of font files on initial load is minimal (often **1–2 total**).

**Implementation**

1. Convert your existing fonts:

  * If you currently self-host `.ttf`, convert to `.woff2`.
2. Update `@font-face` to reference only `.woff2`.

**Example `@font-face`**

```css
@font-face {
  font-family: "MyFont";
  src: url("/fonts/myfont.woff2") format("woff2");
  font-display: swap;
  font-weight: 400 700; /* variable range if applicable */
  font-style: normal;
}
```

### A2) Reduce weights/styles (this is the big win)

**Policy**

* Default: **2 weights max** (e.g., 400 + 600/700).
* Avoid loading separate fonts for tiny differences (500 vs 600, etc.).
* Prefer **variable fonts** if you already have them (can reduce file count).

### A3) Locale-aware font strategy (EN/JA/ZH-CN)

**Recommended approach**

* **English (Latin)**: ship one compact WOFF2 (or variable WOFF2).
* **Japanese / Simplified Chinese**:

  * Prefer **system fonts first** (fastest; avoids giant CJK font downloads).
  * Only ship CJK fonts if you absolutely need a specific look.

**Suggested CSS stacks**

```css
/* English / general UI */
:root { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }

/* zh-Hans */
:root:lang(zh-Hans) {
  font-family: system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif;
}

/* ja */
:root:lang(ja) {
  font-family: system-ui, -apple-system, "Hiragino Kaku Gothic ProN", "Yu Gothic", "Noto Sans JP", sans-serif;
}
```

### A4) Preload rules (especially for China mirror)

**Default**

* Don’t preload fonts unless they’re truly needed above-the-fold.
* Use `font-display: swap` (or `optional` on the China mirror if you’re aggressive).

**Next.js notes**

* If using `next/font`, keep preloading minimal. If you’re self-hosting fonts manually, avoid `<link rel="preload" as="font">` unless justified.

**China mirror policy**

* Still use **WOFF2**.
* Prefer **system fonts** for CJK.
* Avoid font preloads (or **1 max**).

---

## B. JavaScript: reduce client bundle weight + parse cost

Your screenshot suggests “big JS” + possibly client-side instrumentation.

### B1) Audit and eliminate accidental client bundling

**Common causes**

* A library imported in a component that has `"use client"`.
* Shared “utils” file imported by both server and client components.

**Actions**

* Make sure pages/components are **Server Components by default**.
* Only mark the smallest leaf components as `"use client"`.

### B2) Remove/contain OpenTelemetry from client bundles

If you see chunks like `...node_modules_opentelemetry...` in **browser** downloads, treat that as a bug unless you explicitly want it client-side.

**Fix pattern**

* Ensure OTel init runs **server-side only**.
* Avoid importing telemetry in any module used by client components.
* If needed, isolate it behind server-only entrypoints.

**Checklist**

* Search for `opentelemetry` imports.
* Confirm they are only referenced in server runtime codepaths.

### B3) Force code-splitting for “heavy” features

Use dynamic imports for anything not needed on first render:

* animation libs
* markdown renderers
* syntax highlighting
* charts
* big UI packages

**Example (Next.js)**

```ts
import dynamic from "next/dynamic";

const HeavyThing = dynamic(() => import("./HeavyThing"), { ssr: false });
```

### B4) Measure “JS you pay twice”

Even if “Transferred” looks okay, “Size” reflects **decompressed bytes** and correlates with parse/compile cost.

**Targets**

* Main route initial JS: keep as low as possible (rule of thumb: try to stay well under **~300 KB transferred** for initial route if feasible).
* Prioritize fewer + smaller client chunks.

---

## C. Media assets: lazy, smaller formats, avoid surprise downloads

### C1) Ensure media never loads before it’s visible

* Background video/audio should not fetch on initial load.
* Use IntersectionObserver / viewport triggers.

### C2) Convert and serve in modern formats where possible

* Images: **AVIF/WebP**
* Video: consider **mp4/webm** with sane bitrate, short loops

### C3) Cache hard

For static media under hashed filenames:

* `Cache-Control: public, max-age=31536000, immutable`

---

## D. Verification and DoD

### D1) DevTools checks (fast, reliable)

On a cold load with cache disabled:

* Fonts:

  * ✅ Only **WOFF2** fonts download (no TTF)
  * ✅ Number of font requests is minimal
* JS:

  * ✅ No OpenTelemetry chunks in browser downloads (unless intended)
  * ✅ Large features load only when triggered
* Media:

  * ✅ No background media downloaded before in-view

### D2) Throttled performance proof

Record a waterfall + timings under:

* **Fast 3G / Slow 4G**
* mid-tier mobile CPU throttling if available

**Deliverables**

* Screenshot(s) of Network panel showing:

  * Fonts are WOFF2
  * Reduced font count
  * Lazy features not loading at start
* Before/after numbers for:

  * total initial transferred bytes
  * total font transferred bytes
  * initial JS transferred + number of JS requests

---

## Suggested “Done” budgets (practical)

* **Fonts initial transfer:** ideally **≤ 100–200 KB** total (less if using system CJK fonts)
* **Tech stack carousel:** you already have ~50 KB total mostly lazy → ✅ good
* **Initial route JS:** push down as much as possible; prioritize removing client telemetry + reducing `"use client"` surface area

---

## What we shipped (Dec 17)

* **Fonts**: dropped `next/font` + TTF preload; default to system stacks with locale-specific fallbacks (no font downloads on first paint).
* **Chatbot**: moved provider to root layout for persistence; lazy loads with a fast emoji launcher placeholder; hCaptcha split into its own lazy widget to avoid upfront script fetch.
* **JS/telemetry**: browser OTel gated behind `NEXT_PUBLIC_ENABLE_OTEL_BROWSER`; chat loads as lowest-priority chunk while keeping the placeholder visible.
* **Media**: home audio player is dynamically imported (no SSR) to defer its JS until after hydration.

---
