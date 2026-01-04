# Task F4.2 — Localization QA (Tone + Consistency)

Date: 2026-Jan-02

Scope (per WBS): Tone-check localized strings and ensure formatting consistency (dates, numbers, availability labels).

## QA Summary

Audit target:
- `apps/site/data/script-strings_en-ja-zh.md`
- Reference guidelines: `apps/site/data/localization_instructions.md`

Checks performed (static review):
- Table structure: 4 columns, row count matches header (1048 rows).
- Formatting consistency: placeholders, inline code, URLs/emails/paths, and filenames preserved; `""` preserved where English is `""`.
- Tone/formality:
  - Japanese: professional/polite (desu/masu) for full sentences; no casual/slang detected.
  - Chinese: neutral/professional; no casual particles detected.
- Consistency: no guideline violations detected (including backport => 回溯移植, mod casing, timezone slash retention).

## Findings

No required fixes identified.

Optional polish (fragment-style summaries could be converted to full sentences if desired):
- `techStackDetails.aws.summary`
- `techStackDetails.bash.summary`
- `techStackDetails.kvm.summary`
- `techStackDetails.qemu.summary`
- `meetings.availability.description`

## Fixes Applied

None.

## Screenshots (per locale)

Captured and saved in `WBS/` with the required prefix:
- `Task_F4.2_img_home_en.png`
- `Task_F4.2_img_home_ja.png`
- `Task_F4.2_img_home_zh.png`
- `Task_F4.2_img_skim_en.png`
- `Task_F4.2_img_skim_ja.png`
- `Task_F4.2_img_skim_zh.png`

Suggested set (if needed):
- `Task_F4.2_home_en.png`
- `Task_F4.2_home_ja.png`
- `Task_F4.2_home_zh.png`
- `Task_F4.2_experience_en.png`
- `Task_F4.2_experience_ja.png`
- `Task_F4.2_experience_zh.png`
- `Task_F4.2_meetings_en.png`
- `Task_F4.2_meetings_ja.png`
- `Task_F4.2_meetings_zh.png`
- `Task_F4.2_skim_en.png`
- `Task_F4.2_skim_ja.png`
- `Task_F4.2_skim_zh.png`
