# New Page Requirements: [locale]/services/{proof-page}
Purpose: showcase **proof of work** (testimonials, before/after) to increase trust and conversions.

---

## 0) Route + naming
Pick one slug (keep it short, non-hype, fits your tone):
- /[locale]/services/proof

Requirements:
- Route exists for every locale: `/{locale}/services/proof`
- Linked from `/{locale}/services` above CTA, similar to our Home → Services button (e.g., “Proof & testimonials”)
- Include a “Back to Services” link and a Terms & Conditions link to `/{locale}/services/terms`

---

## 1) Goals (what success looks like)
- Provide **credible evidence** you deliver outcomes (not just claims).
- Reduce perceived risk: show **process + artifacts** (before/after, runbook snippets, metrics).
- Make it easy to convert: every item can lead to a **mailto CTA** (“Request something like this” → mailto with subject "Work Request, Similar to [item code]").

---

## 2) Security / complexity constraints (match your low attack surface)
- **Static page** (SSG) built from content files; no forms; no database.
- No third-party embeds required (optional later).
- All external links use `rel="noopener noreferrer"` and open in new tab.
- If you include images, host them locally (or on your existing CDN pipeline), not hotlinked.

---

## 3) Page layout (sections)
### A) Hero
- Title: “Service Proof & Testimonials”
- 1–2 sentence intro: outcomes + trust framing (no bragging)
- CTAs:
  - “Request a Quick Fix” (mailto)
  - “Request Deployment Help” (mailto)
  - “Request Maintenance” (mailto)

### B) Filter Options (to narrow what is displayed below)
- Horizontal filter bar with client-side filtering only
  - Search input box (debounced). Searches across fields: Title, Outcome, Problem, Solution, Stack tags, Client (name/org), Date
  - Button to toggle Case sensitive. Apply case sensitivity to search input box query
  - Button to toggle Exact match. Only show items where a field exactly matches the search input box query (case insensitive by default. Case sensitive only if "Case sensitive" option is on.)
  - Input box scope (multi-select). Frontend name: "Filter upon:". Default: No fields selected. Options: Title/Outcome, Problem/Solution, Stack/Tools, Client, Date
  - Content type (multi-select): Default: No fields selected. Options: Before/After, Testimonials
  - Category (multi-select): Default: No fields selected. Options: Quick Fix / Deployment / Maintenance
  - Sort: Newest first (default), Oldest first
- Behavior:
  - Always load all items; filters only change what is displayed.
  - For multi-select items, if no fields are selected treat this the same as all fields selected. 
  - If zero results, show a small empty state with “Clear filters”.

### C) Before / After section
- single page with “expand/collapse” per entry

Each entry detail includes:
- Product name/company (or “Anonymous, small business”)
- Date (month/year)
- Tech Stack (languages / tools used for changes)
1) **Problem** (2–4 bullets)
2) **Solution** (3–6 bullets)
then upon expanding: 
3) **Before/After**:
  - images or screenshots (optional)
  - or a small “Before vs After” bullet list
4) **Proof artifacts**:
  - optional public links (site URL, status page, etc.)
  - optional code link: :contentReference[oaicite:0]{index=0} repo/PR link (only if public)
5) **Timeline + scope**:
  - “Kickoff → delivery: X business days”
  - “Scope: N fixes, 1 revision”
6) **Testimonial** (optional, if available)
7) CTA:
  - “Request something like this” (mailto with subject referencing entry ID)

### D) Testimonials section
- Show:
  - Quote (short)
  - Name + role/company (or “Anonymous, small business owner”)
  - Date (month/year)
  - Consent/anonymized note if needed

### E) Trust notes / disclaimers
- “Results vary by platform and constraints.”
- “No guarantee of SEO ranking outcomes.”
- Link to Terms page.

---

## 4) Content model (data-driven, easy to add entries)
Store content in two files with localized fields bundled per entry.
Suggested location:
- `content/serviceProofItems.ts`
- `content/serviceTestimonials.ts`

**Requirement:** No CMS needed. Use two files: proof items + testimonials.

Minimum schema:
```ts
type LocaleKey = "en" | "ja" | "zh"; // keep in sync with app locales
type Localized<T> = Record<LocaleKey, T>; // require all locales (no partials)

type ProofCategory = "quick-fix" | "deployment" | "maintenance";

type ImageRef = {
  src: string;
  alt: Localized<string>;
  caption?: Localized<string>;
};

type LinkRef = {
  label: Localized<string>;
  href: string;
};

type ServiceProofItem = {
  id: string;               // "qf-001" (non-localized)
  title: Localized<string>;
  category: ProofCategory;
  date: string;             // "YYYY-MM" (format in UI by locale)
  outcome_one_liner: Localized<string>;
  stack_tags: string[];     // e.g. ["Next.js", "Vercel", "Postgres"]

  // Detail content
  problem: Localized<string[]>;   // bullets
  solution: Localized<string[]>;  // bullets

  // Before / After detail (either bullets, images, or both)
  before?: { bullets?: Localized<string[]>; images?: ImageRef[] };
  after?: { bullets?: Localized<string[]>; images?: ImageRef[] };

  // Proof artifacts
  artifacts?: {
    links?: LinkRef[];      // site/status/etc (public only)
    repo_or_pr?: LinkRef;   // public link only
    notes?: Localized<string[]>; // short text clues, no secrets
  };

  // Timeline + scope
  timeline?: {
    kickoff?: string;       // "2000-June-03"
    delivery?: string;      // "2000-June-07"
    duration_business_days?: number;
    scope?: Localized<string>;
  };

  // Metrics (optional)
  metrics?: {
    label: Localized<string>;
    before?: Localized<string>;
    after?: Localized<string>;
    note?: Localized<string>;
  }[];

  // Attribution / privacy
  is_anonymized: boolean;
  client?: {
    name?: string;          // non-localized proper name
    role?: Localized<string>;
    org?: Localized<string>;
    note?: Localized<string>;
  };

  // Optional link to testimonial(s)
  testimonial_ids?: string[];

  // CTA (optional override)
  mailto_subject?: Localized<string>; // default: "Work Request, Similar to {id}"
};

type ServiceTestimonial = {
  id: string;               // "t-001" (non-localized)
  quote: Localized<string>;
  date: string;             // "YYYY-MM"
  category?: ProofCategory;
  stack_tags?: string[];

  // Attribution / privacy
  is_anonymized: boolean;
  client?: {
    name?: string;
    role?: Localized<string>;
    org?: Localized<string>;
    note?: Localized<string>;
  };

  // Optional cross-reference
  related_proof_id?: string;
};

```
