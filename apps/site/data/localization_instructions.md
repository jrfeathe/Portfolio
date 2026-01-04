# Localization Instructions

Use this guide when translating the uploaded `script-extracted_strings_en.md` (full snapshot) or `script-extracted_strings_en_delta.md` (updates) into Japanese (ja) and Simplified Chinese (zh).

## Output Format
- Keep the Markdown table structure and row order.
- Do not change the `String` key or the English column (including capitalization, punctuation, or spacing).
- If the table has only two columns, append "Japanese" as column 3 and "Simplified Chinese" as column 4.
- If the columns already exist, fill them and leave other columns untouched.
- Add the translation in the target language column only.
- Keep all non-table text (title, Part line, Source line, Generated line, section headers) unchanged.
- Do not add extra commentary, citations, links, or tool notes.

## Tone and Formality
- Overall tone: professional, confident, and friendly.
- UI labels: short and direct; avoid unnecessary punctuation.
- Long sentences/paragraphs: clear and natural, not overly verbose.

Japanese (ja):
- Polite, neutral business tone (desu/masu for full sentences).
- Short labels can be noun phrases.
- Avoid slang or overly casual phrasing.

Simplified Chinese (zh):
- Neutral professional tone.
- Use standard UI terms; keep concise.
- Avoid slang or overly casual phrasing.

## Consistency
- Keep translations consistent across repeated terms.
- Use the exact same translation for repeated keys unless context requires otherwise.

## Preserve Structure and Tokens
- Preserve placeholders exactly: `{count}`, `{minutes}`, `{name}`, etc.
- Preserve inline code/backticks and any Markdown formatting.
- Preserve `""` (empty string) exactly as-is.
- Do not translate URLs, emails, file names, or paths.
- Do not translate single-character icon labels (e.g., `X`, arrows).
- Do not reflow lines, wrap text, or add ellipses; translate the full string as provided.

## Product and Proper Names
- Keep proper names as-is (e.g., Jack, Jack Featherstone).
- For tool/tech names, keep the Latin/English brand name by default.
- Only translate a tech name if it has a clearly established, widely used localized form; otherwise leave it in English.

## Glossary / Casing Rules
- Chinese: translate "backport" as 回溯移植.
- Japanese: for romanized "mod/mods/modpack", match the English casing (avoid "MOD" unless the English is "MOD").

## Timezone Labels
- Strings like `Region/City` should keep the slash and ordering.
- Translate the region/city names if a common localized form exists; otherwise keep the English form.
- Do not remove or reorder segments.

## Large Files / Chunking
- The file has been sectioned into smaller parts.
- Translate each part completely and in order.
- If you cannot finish a part, stop at a row boundary and state where you stopped.

## Output Only
- Return the updated Markdown content for that part file only.
- Do not include intermediate analysis, code, or debug output.

## Common Pitfalls
- Editing the English column or `String` key (even capitalization or spacing).
- Changing the header lines, part count, or source lines.
- Adding commentary, citations, links, or tool/code output.
- Reflowing lines, wrapping text, or inserting ellipses; translate the full string as provided.
- Global search/replace across all columns; edit only the target language columns.
