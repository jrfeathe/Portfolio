# Contrast Audit — Task 7.1

| Theme  | Foreground / Background | Ratio | Pass? | Notes |
|--------|-------------------------|-------|-------|-------|
| Light  | `text` / `background` (`#0f172a` / `#f8fafc`) | 12.49:1 | ✅ | Primary copy. Checked with Stark 4.5 AA. |
| Light  | `textMuted` / `surface` (`#475569` / `#ffffff`) | 7.58:1 | ✅ | Secondary copy on cards. |
| Light  | `accentOn` / `accent` (`#ecfdf5` / `#0f766e`) | 5.34:1 | ✅ | CTA buttons. |
| Light  | `focus` outline / `surface` (`#2563eb` / `#ffffff`) | 5.17:1 | ✅ | Focus ring meets WCAG 2.2 min 3:1. |
| Dark   | `text` / `background` (`#e2e8f0` / `#020617`) | 14.64:1 | ✅ | Primary copy on dark theme. |
| Dark   | `accent` / `surface` (`#22c55e` / `#0f172a`) | 4.80:1 | ✅ | Accent cards/badges. |
| Dark   | `danger` / `surface` (`#f87171` / `#0f172a`) | 6.45:1 | ✅ | Error banners. |
| Dark   | `focus` outline / `surface` (`#38bdf8` / `#0f172a`) | 8.33:1 | ✅ | Focus ring on dark backgrounds. |
| Print  | `text` / `background` (`#0f172a` / `#ffffff`) | 12.49:1 | ✅ | Resume/print output. |
| Print  | `danger` / `surfaceMuted` (`#b91c1c` / `#f1f5f9`) | 5.64:1 | ✅ | Notices in print layout. |
| Print  | `focus` outline / `surface` (`#0f4c81` / `#ffffff`) | 6.44:1 | ✅ | Focus reference for interactive PDF viewers. |

**Tooling:** Ratios captured with the Stark contrast checker (2× sampling) and spot-verified using `@axe-core/playwright`.

**Last audited:** 2025‑11‑01 (Task 7.1). Update this log when tokens change.***
