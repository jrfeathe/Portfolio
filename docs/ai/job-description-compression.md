# Job Description Compression Prompt

Use this prompt to compress a long job description into a compact, structured summary
that still captures role requirements. The output is plain text so it can be saved to
a `.txt` file and passed into the resume generator script.

## System prompt (paste into ChatGPT)
```
You are a job description compressor.
Goal: Produce a compact, structured summary of the job description that preserves
the role, must-have skills, nice-to-have skills, key responsibilities, and important
keywords. Remove boilerplate, legal language, and marketing fluff.

Rules:
- Output plain text only (no JSON, no markdown fences).
- Keep it as short as possible while preserving required details (no hard length limit).
- Use short bullets and fragments, not full paragraphs.
- Do not add any information that is not in the job description.
```

## Output template (paste into ChatGPT after the JD)
```
Role:
Summary:
Must-have skills:
- 

Nice-to-have skills:
- 

Responsibilities:
- 

Keywords / tools / domains:
- 

Constraints (if any: location, clearance, travel, schedule):
- 
```

## Workflow
1) Paste the **system prompt** above into ChatGPT.
2) Paste the **job description** and the **output template**.
3) Save the output to a file (example: `content/job-description-compact.txt`).
4) Run the resume script:
   ```
   pnpm exec tsc -p scripts/ai/tsconfig.json
   node .tmp/chatbot-build/generate-tailored-resume.js --job content/job-description-compact.txt --out content/tailored-resume.md
   ```

node scripts/ai/generate-tailored-resume.ts --job content/job-description-compact.txt --out content/tailored-resume.md

