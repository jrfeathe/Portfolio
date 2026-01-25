# CDN Cache Rules (Recommended)

Date: 2026-01-25

## Goals
- Cache HTML at the edge for fast, global TTFB.
- Preserve correctness for query‑param driven variants (e.g., `?skim=1`).
- Keep APIs un‑cached unless explicitly allowed.

## Cache Policy
### HTML pages (App Router)
- **Respect origin Cache-Control** (Next sets `s-maxage=31536000, stale-while-revalidate` for static routes).
- **Cache key must include query params** (especially `?skim=1`).
- Allow `stale-while-revalidate` behavior if your CDN supports it.

### Static assets
- Cache `/_next/static/*` and `/public/*` with long TTL (1 year) and **immutable**.
- Keep Brotli + gzip enabled.

### API routes
- Bypass cache for `/api/*` unless a specific endpoint is explicitly cacheable.
- Ensure cookies/authorization headers do not accidentally force caching.

## Fastly-specific notes
- **Cache key**: Fastly’s default cache key includes the full URL **including query string** and the `Host` header; it also honors `Vary` as a secondary key. This means `?skim=1` will be cached separately by default.
- **Origin cache headers**: Fastly’s cache freshness order is `Surrogate-Control`, then `Cache-Control: s-maxage`, then `Cache-Control: max-age`, then `Expires`. Use `Surrogate-Control` when you want CDN-only TTLs that differ from browser caching.
- **SWR / SIE**: You can control `stale-while-revalidate` / `stale-if-error` using `Surrogate-Control` or `Cache-Control`. Use `Surrogate-Control` if you want stale behavior only at the CDN.
- **Bypass cache**: In VCL services, `return(pass)` in `vcl_recv` bypasses cache for `/api/*` and auth paths.

### Fastly VCL snippet (starter)
```vcl
sub vcl_recv {
  # Pass through any non-idempotent request.
  if (req.method != "GET" && req.method != "HEAD") {
    return (pass);
  }

  # Do not cache APIs.
  if (req.url.path ~ "^/api/") {
    return (pass);
  }

  # Keep query strings in the cache key (default Fastly behavior).
  return (hash);
}
```

### Notes
- Do **not** strip query params globally; `?skim=1` is a valid HTML variant.
- Preserve `ETag` and `Cache-Control` from origin.

## Quick Verification
After deploy, inspect headers for:
- `Cache-Control: s-maxage=...` on `/en`, `/en/experience`, `/en/notes`.
- `x-nextjs-cache: HIT` (or CDN hit header).
- `Vary: RSC, Next-Router-State-Tree, Next-Router-Prefetch, Accept-Encoding`.

## Glossary
- **CDN**: Content Delivery Network.
- **TTL**: Time To Live (cache duration).
- **TTFB**: Time To First Byte.
- **API**: Application Programming Interface.
- **VCL**: Varnish Configuration Language (Fastly’s edge configuration language).
- **SWR**: Stale‑While‑Revalidate.
- **SIE**: Stale‑If‑Error.
- **ETag**: Entity Tag (response version identifier).
- **RSC**: React Server Components (Next.js app router header).
- **s-maxage**: Shared cache max age (CDN/edge cache TTL).
