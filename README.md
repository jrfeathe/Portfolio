# Portfolio

Modern single-page portfolio built with React, Vite, and TypeScript to highlight skills and contact information. 
The project is intentionally lean, with no server, database, or authentication stack, so it can deploy as static assets on platforms like Netlify, Vercel, GitHub Pages, or Cloudflare Pages.

## Features
- Skills, projects, and contact sections tailored for personal branding.
- Fully static build with zero backend dependencies.
- Type-safe components and content definitions using TypeScript.

## Tech Stack
- React 19 + React DOM for the UI layer.
- Vite 7 for lightning-fast dev server and optimized production builds.
- TypeScript 5 for static typing across components and content.
- ESLint + TypeScript ESLint plugins to maintain code quality.
- Vitest for component and utility testing.

## Getting Started
1. Install Node.js 18+ (LTS recommended).
2. Install dependencies and generate a fresh lockfile: `npm install`.
3. Launch the local dev server: `npm run dev`.
4. Open the URL shown in the terminal (default `http://localhost:5173`) to preview changes.

## Available Scripts
- `npm run dev` starts Vite in development mode with hot module replacement.
- `npm run build` type-checks and creates an optimized bundle in `dist/`.
- `npm run preview` serves the production bundle locally for smoke testing.
- `npm run lint` runs ESLint on the entire project.

---
