# Job Studio

Resume Workflow:
1. Copy the job description into ChatGPT using the instructions in `apps/job-studio/job-description-compression.md`.
2. Paste the response into `apps/job-studio/job-description-compact.txt`.
3. Build the AI scripts if needed: `pnpm exec tsc -p scripts/ai/tsconfig.json`.
4. Generate the resume (defaults to the Job Studio paths): `node .tmp/chatbot-build/generate-tailored-resume.js`.
5. Or run the TypeScript entrypoint directly: `node scripts/ai/generate-tailored-resume.ts` (defaults to the Job Studio paths; `--job`/`--out` override them).
6. Copy fields from `apps/job-studio/tailored-resume.md` into your resume template.
