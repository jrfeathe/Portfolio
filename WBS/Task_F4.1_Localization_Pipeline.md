# Task F4.1 Localization Pipeline

This document captures the extraction, translation, audit, and compaction workflow used for Task F4.1. It also lists the scripts used or introduced for this pipeline and the canonical files they produce.

## Goals

- Extract all user-facing strings into a structured export.
- Translate into Japanese and Simplified Chinese using consistent tone and formatting.
- Audit translations for tone, formatting, and terminology consistency.
- Compact localized part files into a single deliverable.

## Scripts

### scripts/export-EN-strings.js (new)

Purpose: Export English strings and generate localization chunks.

Outputs:
- `apps/site/data/script-extracted_strings_en.md`
- `apps/site/data/script-skipped_strings_en.md`
- `apps/site/data/script-extracted_strings_en_delta.md`
- `apps/site/data/script-extracted_strings_en_hashes.json`
- `apps/site/data/localization_chunks/script-extracted_strings_en_part-###.md`
- `apps/site/data/localization_chunks/script-extracted_strings_en_chunks_manifest.md`

Common usage:
- Full export (no chunking):
  - `node scripts/export-EN-strings.js`
- Export with chunking (recommended for localization):
  - `node scripts/export-EN-strings.js --chunk-size 100`

Notes:
- Chunking is driven by the `--chunk-size` option. Choose a size that keeps each part manageable for ChatGPT.
- The export includes strings from projects, tech stack details, resume, timezones, and dictionaries.

### scripts/compact-localization-responses.js (new)

Purpose: Combine localized part files into a single 4-column table (String, English, Japanese, Simplified Chinese).

Inputs:
- `apps/site/data/localization_responses/script-extracted_strings_ja-zh_part-###.md`

Output:
- `apps/site/data/script-strings_en-ja-zh.md`

Usage:
- `node scripts/compact-localization-responses.js`

Optional flags:
- `--input-dir apps/site/data/localization_responses`
- `--output apps/site/data/script-strings_en-ja-zh.md`

Validation behavior:
- Requires every row to have 4 columns.
- Errors on duplicate keys.
- Warns if part numbers are missing.

## Localization Workflow

### 1) Generate English export + chunks

Command:
- `node scripts/export-EN-strings.js --chunk-size 100`

Artifacts:
- `apps/site/data/script-extracted_strings_en.md`
- `apps/site/data/localization_chunks/script-extracted_strings_en_part-###.md`

### 2) Translate each part

For each part file:
- Input: `apps/site/data/localization_chunks/script-extracted_strings_en_part-###.md`
- Output: `apps/site/data/localization_responses/script-extracted_strings_ja-zh_part-###.md`

The localization response must preserve the same table ordering and keys, and add two columns:
- Japanese
- Simplified Chinese

### 3) Audit and correct translations

Key checks performed on every part:
- English column matches the source part exactly.
- No markdown links in any column (use raw email/URL strings).
- Japanese tone is polite and consistent (desu/masu). Avoid fragments for sentences.
- Chinese tone is neutral and professional.
- Empty strings remain `""` across columns.
- Tech names are kept in Latin unless there is a very common translation.
- Terminology consistency:
  - "backport" => Chinese uses `回溯移植`
  - "mod"/"modpack" lowercase unless English title case demands `Mods`
  - "ON/OFF" => Japanese uses `オン/オフ`

### 4) Compact all localized parts

Command:
- `node scripts/compact-localization-responses.js`

Output:
- `apps/site/data/script-strings_en-ja-zh.md`

## Part Files and Naming

English chunks (input):
- `apps/site/data/localization_chunks/script-extracted_strings_en_part-001.md`
- ...
- `apps/site/data/localization_chunks/script-extracted_strings_en_part-011.md`

Localization responses (output):
- `apps/site/data/localization_responses/script-extracted_strings_ja-zh_part-001.md`
- ...
- `apps/site/data/localization_responses/script-extracted_strings_ja-zh_part-011.md`

Combined localization table:
- `apps/site/data/script-strings_en-ja-zh.md`

## Translation Guidelines Snapshot

- Preserve the String key column exactly as-is.
- Preserve punctuation, casing, and spacing in the English column.
- Keep `""` empty values as `""` in both Japanese and Chinese.
- Avoid adding extra formatting (no markdown links or additional markup).
- Keep product and tool names in Latin unless there is a well-known localized name.
- Prefer short, natural Japanese in polite form.
- Prefer clear, neutral Simplified Chinese.

## Spot-checks (2026-Jan-02)

Static spot-checks (code/data review; no runtime UI):

- Home/Skim/Meetings/Experience dictionaries for en/ja/zh reviewed in `apps/site/src/utils/dictionaries.ts` (hero, skim, sections, meetings labels present; locale copy present where expected).
- Resume links aligned per locale: `home.footer.resumeHref` points to `/resume.pdf` for en/ja/zh and file exists at `apps/site/public/resume.pdf`.
- Resume data localized: `content/resume.json` contains en/ja/zh values for key fields (basics, skills, experience).
- Project/tech stack locale data validated: `apps/site/data/projects/*.json` (non-draft) + `apps/site/data/tech-stack-details.json` contain en/ja/zh entries with no missing locale values; draft/template files still include gaps and are not used at runtime.
