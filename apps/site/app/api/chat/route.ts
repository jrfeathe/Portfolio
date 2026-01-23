import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

import {
  buildContextBlock,
  buildReferences,
  loadChatResources,
  retrieveContext,
  buildWorkEducationFacts,
  sanitizeText,
  type RetrievalHit,
  type AnchorEntry,
  type AnchorCategory
} from "../../../src/lib/ai/chatbot";
import { isBenignLocationQuestion, isBenignStructuralPrompt, runLocalModeration } from "../../../src/lib/ai/moderation";
import {
  clampConfidence,
  computeModerationOutcome,
  normalizeModerationLabel,
  type ModerationDecision,
  type ModerationLabel
} from "../../../src/lib/ai/moderationOutcome";
import { getDictionary } from "../../../src/utils/dictionaries";
import { defaultLocale, isLocale, type Locale } from "../../../src/utils/i18n";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type ChatRequestBody = {
  message?: string;
  locale?: string;
  sessionId?: string;
  history?: ChatMessage[];
  captchaToken?: string;
};

type ModelResult = {
  text: string;
  model?: string;
  finishReason?: string;
};

function isAvailabilityQuestion(text: string): boolean {
  return /\b(availability|available|schedule|time\s*zone|timezone|hours?|meeting|meetings|book\s+a\s+call|book\s+a\s+meeting|when\s+can\s+we\s+meet)\b/i.test(
    text
  );
}

const WRONG_PERSONA_PATTERNS = [/jack\s+tyler\s+engineering/i];
const TOP_SKILL_ANCHOR_IDS = ["react", "typescript", "javascript", "cpp", "java", "linux", "c"];
const SKILL_EXCLUDE_PATTERNS = [/fabrication/i, /\bbam\b/i, /\bplasma\b/i, /\bsigns?\b/i];
const SKILL_INCLUDE_EXPERIENCE_PATTERNS = [/rollodex/i, /\bta\b/i, /teaching/i, /mentor/i, /ser\s*321/i];

function isSkillStrengthQuestion(text: string): boolean {
  const patterns = [
    /\b(best|top|strong(est)?|core)\s+skills?\b/i,
    /\bstrengths?\b/i,
    /\b(good|great|strong)\s+(coder|developer|engineer|programmer)\b/i,
    /\b(good|great)\s+at\s+(coding|programming|writing\s+code|software\s+development)\b/i,
    /\bhow\s+(good|strong)\s+(is|are)\s+(jack|he)\s+(as\s+a\s+)?(coder|developer|programmer|engineer)\b/i
  ];
  return patterns.some((pattern) => pattern.test(text));
}

function findAnchorByCategory(anchors: AnchorEntry[], category: AnchorCategory, locale: Locale): AnchorEntry | undefined {
  return anchors.find((anchor) => anchor.category === category && anchor.locale === locale);
}

function findTechAnchorsForKeywords(
  reply: string | null,
  anchors: AnchorEntry[],
  locale: Locale,
  existingHrefs: Set<string>
): AnchorEntry[] {
  if (!reply) return [];
  const lowered = reply.toLowerCase();
  const KEYWORDS = [
    "react",
    "typescript",
    "javascript",
    "next.js",
    "nextjs",
    "node",
    "node.js",
    "fullstack",
    "frontend",
    "backend",
    "accessibility",
    "performance",
    "reliability",
    "c++",
    "cpp",
    "java",
    "linux",
    "ta",
    "teaching assistant",
    "teaching"
  ];
  const matches = KEYWORDS.filter((keyword) => lowered.includes(keyword));

  if (matches.length === 0) return [];

  const techAnchors = anchors.filter((anchor) => anchor.category === "tech" && anchor.locale === locale);
  const results: AnchorEntry[] = [];

  for (const anchor of techAnchors) {
    const anchorName = anchor.name.toLowerCase();
    const anchorId = anchor.id.toLowerCase();
    if (matches.some((keyword) => anchorName.includes(keyword) || anchorId.includes(keyword))) {
      if (!existingHrefs.has(anchor.href)) {
        existingHrefs.add(anchor.href);
        results.push(anchor);
      }
    }
  }

  return results;
}

function findAnchorsByIds(
  anchors: AnchorEntry[],
  ids: string[],
  locale: Locale,
  existingHrefs: Set<string>
): AnchorEntry[] {
  const matches: AnchorEntry[] = [];
  for (const id of ids) {
    const anchor = anchors.find((entry) => entry.id === id && entry.locale === locale);
    if (anchor && !existingHrefs.has(anchor.href)) {
      existingHrefs.add(anchor.href);
      matches.push(anchor);
    }
  }
  return matches;
}

function anchorToReference(anchor: AnchorEntry): { title: string; href: string } {
  return { title: anchor.name, href: anchor.href };
}

function findAnchorByHref(anchors: AnchorEntry[], href: string, locale: Locale): AnchorEntry | undefined {
  return (
    anchors.find((anchor) => anchor.href === href && anchor.locale === locale) ??
    anchors.find((anchor) => anchor.href === href && anchor.locale === defaultLocale)
  );
}

function extractInlineLinks(markdown: string | null): Array<{ text: string; href: string }> {
  if (!markdown) return [];
  const matches: Array<{ text: string; href: string }> = [];
  const linkPattern = /\[([^\]]+)\]\(\s*([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = linkPattern.exec(markdown)) !== null) {
    const text = match[1]?.trim();
    const href = match[2]?.trim();
    if (!href || !href.startsWith("/")) continue;
    matches.push({ text, href });
  }
  return matches;
}

const MAX_INPUT_LENGTH = 1200;
const MAX_HISTORY = 6;
const MAX_PROMPTS_PER_HOUR = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const CAPTCHA_THRESHOLD = 2; // Require captcha starting at the 3rd prompt
const CAPTCHA_SOLVED_TTL_MS = 60 * 60 * 1000;
const HCAPTCHA_VERIFY_URL = "https://hcaptcha.com/siteverify";
const CHAT_LOG_DIR = path.join(process.cwd(), "logs", "chatbot");

const rateLimitBuckets = new Map<string, number[]>();
const sessionPromptCounts = new Map<string, number>();
const captchaSolved = new Map<string, number>();
const BRAND_CORRECTIONS: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /\bRolodex\b/gi, replacement: "Rollodex" }
];
const WORK_EDU_PATTERNS = [
  /\beducation\b/i,
  /\bschool\b/i,
  /\bcollege\b/i,
  /\buniversity\b/i,
  /\bdegree\b/i,
  /\bdiploma\b/i,
  /\bgpa\b/i,
  /\bgraduat(e|ion)\b/i,
  /\bwork\b/i,
  /\bjob\b/i,
  /\bemploy(ed|ment)?\b/i,
  /\bexperience\b/i,
  /\bworked\b/i,
  /\bintern(ship)?\b/i,
  /\bta\b/i,
  /\bteaching\s+assistant\b/i,
  /\bcaptech\b/i,
  /\bbam\b/i
];

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const ip = (request.headers.get("x-real-ip") ?? "").trim();
  return ip || "unknown";
}

function ensureSessionId(value?: string) {
  const safeValue = value?.trim().slice(0, 100);
  return safeValue && safeValue.length >= 8 ? safeValue : crypto.randomUUID();
}

function enforceRateLimit(key: string): { allowed: true; remaining: number } | { allowed: false; retryAfterMs: number } {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const entries = rateLimitBuckets.get(key) ?? [];
  const recent = entries.filter((timestamp) => timestamp >= windowStart);

  if (recent.length >= MAX_PROMPTS_PER_HOUR) {
    const retryAfterMs = Math.max(0, windowStart + RATE_LIMIT_WINDOW_MS - now);
    return { allowed: false, retryAfterMs };
  }

  recent.push(now);
  rateLimitBuckets.set(key, recent);
  return { allowed: true, remaining: MAX_PROMPTS_PER_HOUR - recent.length };
}

function summarizeHistory(history: ChatMessage[]): ChatMessage[] {
  if (!Array.isArray(history) || !history.length) {
    return [];
  }
  const pairs: ChatMessage[] = [];
  let pendingUser: ChatMessage | null = null;

  for (const entry of history) {
    if (entry.role === "user") {
      pendingUser = entry;
      continue;
    }
    if (entry.role === "assistant" && pendingUser) {
      pairs.push(
        { role: "user", content: pendingUser.content },
        { role: "assistant", content: entry.content }
      );
      pendingUser = null;
    }
  }

  return pairs
    .slice(-MAX_HISTORY)
    .map((entry) => ({
      role: entry.role,
      content: sanitizeText(entry.content).slice(0, 1200)
    }));
}

function hashValue(value?: string) {
  if (!value || value === "unknown") {
    return "unknown";
  }
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 12);
}

async function writeChatLog(entry: Record<string, unknown>) {
  try {
    await fs.mkdir(CHAT_LOG_DIR, { recursive: true });
    const date = new Date();
    const dateKey = date.toISOString().slice(0, 10);
    const filePath = path.join(CHAT_LOG_DIR, `chatbot-${dateKey}.jsonl`);
    const line = JSON.stringify({ timestamp: date.toISOString(), ...entry }) + "\n";
    await fs.appendFile(filePath, line, "utf8");
  } catch (error) {
    console.error("[chatbot] Failed to write chat log:", error);
  }
}

async function logChatEvent(event: string, payload: Record<string, unknown>) {
  const entry = { level: "info", event, ...payload };
  try {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(entry));
  } catch {
    // Swallow logging errors
  }
  await writeChatLog(entry);
}

function buildChatLogPayload(params: {
  session: string;
  ip: string;
  promptCount: number;
  locale: Locale;
  rateLimitRemaining: number;
  message: string;
  reply: string;
  references: Array<{ title: string; href: string }>;
  contextFacts?: unknown[];
  model?: string;
  modelReplyRaw?: string | null;
  finishReason?: string;
  usedFallback: boolean;
  unprofessional: boolean;
  pass1Blocked: boolean;
  pass2Ran: boolean;
  moderation: Record<string, unknown>;
  extras?: Record<string, unknown>;
}) {
  const response: Record<string, unknown> = {
    reply: params.reply,
    unprofessional: params.unprofessional
  };

  if (!params.pass1Blocked) {
    response.references = params.references;
    response.contextFacts = params.contextFacts ?? [];
    response.model = params.model;
    response.modelReplyRaw = params.modelReplyRaw ?? undefined;
    response.finishReason = params.finishReason;
    response.usedFallback = params.usedFallback;
  }

  return {
    session: params.session,
    ip: params.ip,
    locale: params.locale,
    counts: { prompt: params.promptCount },
    usage: { rateLimitRemaining: params.rateLimitRemaining },
    request: { message: params.message },
    response,
    pass1Blocked: params.pass1Blocked,
    pass2Ran: params.pass2Ran,
    moderation: params.moderation,
    ...(params.extras ?? {})
  };
}

function hasValidCaptcha(sessionId: string): boolean {
  const solvedUntil = captchaSolved.get(sessionId);
  return Boolean(solvedUntil && solvedUntil > Date.now());
}

function shouldRequireCaptcha(sessionId: string, promptCount: number): boolean {
  if (promptCount < CAPTCHA_THRESHOLD) {
    return false;
  }
  return !hasValidCaptcha(sessionId);
}

function extractMessageContent(choice: unknown): string {
  if (!choice || typeof choice !== "object") {
    return "";
  }

  const message = (choice as { message?: unknown }).message;
  if (!message || typeof message !== "object") {
    return "";
  }

  const content = (message as { content?: unknown }).content;
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }
        if (part && typeof part === "object" && typeof (part as { text?: unknown }).text === "string") {
          return (part as { text: string }).text;
        }
        return "";
      })
      .join("")
      .trim();
  }

  const messageText = (message as { text?: unknown }).text;
  return typeof messageText === "string" ? messageText : "";
}

function stripNoFunFlag(text: string): { text: string; flagged: boolean } {
  const flagRegex = /\bFLAG_NO_FUN\b/i;
  if (!flagRegex.test(text)) {
    return { text, flagged: false };
  }
  const cleaned = text.replace(flagRegex, "").trim();
  return { text: cleaned || "", flagged: true };
}

function applyBrandCorrections(text: string): string {
  return BRAND_CORRECTIONS.reduce((current, rule) => current.replace(rule.pattern, rule.replacement), text);
}

function ensureLinkSpacing(text: string): string {
  // Insert a space before markdown links that are jammed against the previous word.
  return text.replace(/([A-Za-z0-9])(\[([^\]]+)\]\([^)]+\))/g, "$1 $2");
}

function stripBracketedUrls(text: string): string {
  return text.replace(/\s*\[[^\]]*(?:https?:\/\/|\/)[^\]]*\]/g, "");
}

function stripRawUrls(text: string): string {
  return text
    .replace(/\((https?:\/\/[^\s)]+)\)/g, "")
    .replace(/https?:\/\/[^\s)]+/g, "")
    .replace(/\bwww\.[^\s)]+/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function normalizeParens(text: string): string {
  return text.replace(/\(\s*\)/g, "").replace(/\)\s*\)/g, ")").replace(/\s{2,}/g, " ").trim();
}

function isWorkEducationQuestion(message: string): boolean {
  return WORK_EDU_PATTERNS.some((pattern) => pattern.test(message));
}

function isResumeOnlyQuestion(message: string): boolean {
  return /\b(resume|cv|curriculum\s+vitae|resume\s+pdf|download\s+resume)\b/i.test(message) ||
    /(履歴書|職務経歴書|简历|履历)/i.test(message);
}

async function verifyHCaptchaToken(token: string, ip: string | undefined) {
  const secret = process.env.HCAPTCHA_SECRET_KEY;
  if (!secret) {
    console.error("[chatbot] HCAPTCHA_SECRET_KEY is not set; captcha validation unavailable.");
    return { success: false, reason: "captcha_not_configured" as const };
  }

  const body = new URLSearchParams({
    secret,
    response: token
  });

  if (ip && ip !== "unknown") {
    body.set("remoteip", ip);
  }

  try {
    const response = await fetch(HCAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString()
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(
        "[chatbot] hCaptcha verification failed",
        response.status,
        response.statusText,
        errorText?.slice(0, 200)
      );
      return { success: false, reason: "captcha_verify_failed" as const };
    }

    const payload = (await response.json()) as { success?: boolean; "error-codes"?: string[] };
    if (!payload.success) {
      console.warn("[chatbot] hCaptcha rejected token", payload?.["error-codes"]);
      return { success: false, reason: "captcha_invalid" as const };
    }

    return { success: true as const };
  } catch (error) {
    console.error("[chatbot] hCaptcha verification error:", error);
    return { success: false, reason: "captcha_network_error" as const };
  }
}

function resolveReferer(request: Request) {
  const origin = request.headers.get("origin") ?? request.headers.get("referer");
  if (origin) {
    return origin;
  }

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (host) {
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    return `${proto}://${host}`;
  }

  return process.env.OPENROUTER_APP_URL ?? "";
}

async function callOpenRouter(
  request: Request,
  instructions: string,
  question: string,
  locale: Locale,
  hits: RetrievalHit[],
  history: ChatMessage[],
  anchors: AnchorEntry[],
  safeIntent: boolean,
  retryHint?: string
): Promise<ModelResult | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn("[chatbot] Missing OPENROUTER_API_KEY; using fallback reply.");
    return null;
  }

  const model =
    process.env.OPENROUTER_MODEL ??
    "openrouter/auto"; // Prefer OpenRouter's cheapest/auto routing when no model is set.

  const availabilityQuestion = isAvailabilityQuestion(question);
  const skillStrengthQuestion = isSkillStrengthQuestion(question);

  const contextItems = skillStrengthQuestion || availabilityQuestion ? 8 : 5;
  const contextChars = skillStrengthQuestion || availabilityQuestion ? 800 : 400;
  const contextBlock = buildContextBlock(hits, { maxItems: contextItems, maxChunkChars: contextChars });
  const shortContextBlock = buildContextBlock(hits, { maxChunkChars: 320, maxItems: 3 });
  const trimmedHistory = summarizeHistory(history);
  const referer = resolveReferer(request);
  const anchorByLocale = new Map(anchors.map((anchor) => [`${anchor.id}-${anchor.locale}`, anchor]));
  const allowedLinkSet = new Map<string, string>();

  for (const hit of hits) {
    const anchor =
      anchorByLocale.get(`${hit.chunk.sourceId}-${locale}`) ??
      anchorByLocale.get(`${hit.chunk.sourceId}-${defaultLocale}`);
    const href = anchor?.href ?? hit.chunk.href;
    const title = anchor?.name ?? hit.chunk.title;
    if (!allowedLinkSet.has(href)) {
      allowedLinkSet.set(href, title);
    }
  }

  const resumeAnchor =
    anchors.find((anchor) => anchor.category === "resume" && anchor.locale === locale) ??
    anchors.find((anchor) => anchor.category === "resume" && anchor.locale === defaultLocale);
  if (resumeAnchor && !allowedLinkSet.has(resumeAnchor.href)) {
    allowedLinkSet.set(resumeAnchor.href, resumeAnchor.name);
  }
  if (!allowedLinkSet.has("/resume.pdf")) {
    allowedLinkSet.set("/resume.pdf", "Resume");
  }

  if (skillStrengthQuestion) {
    for (const id of TOP_SKILL_ANCHOR_IDS.concat(["rollodex", "ser321"])) {
      const anchor =
        anchors.find((entry) => entry.id === id && entry.locale === locale) ??
        anchors.find((entry) => entry.id === id && entry.locale === defaultLocale);
      if (anchor && !allowedLinkSet.has(anchor.href)) {
        allowedLinkSet.set(anchor.href, anchor.name);
      }
    }
  }

  const allowedLinks = Array.from(allowedLinkSet.entries())
    .map(([href, title]) => `- ${title}: ${href}`)
    .join("\n");

  const systemPrompt =
    `${instructions.trim()}\n\n` +
    "Operate as Jack's portfolio assistant. Keep replies concise (2–5 sentences), " +
    "lead with a confident yes/solution, ground claims in the provided context, offer a next step, " +
    "avoid raw URLs in the reply body (links are shown separately), stay professional, avoid salary/PII, " +
    "and mention the logging notice when relevant. " +
    "If the prompt has safe recruiting intent, answer normally and do NOT return FLAG_NO_FUN. " +
    "For subjective asks (e.g., whether Jack is a good coder/engineer or how strong he is), cite only evidence from the provided materials (projects, tech stack, resume) or state that the materials do not say; never speculate. " +
    "Jack/He always refers to Jack Featherstone (software engineer, subject of this portfolio). Never answer about any other Jack. " +
    "Use ONLY the retrieved context snippets and the allowed-link list; if the answer is not in the provided context, say it is not available in the provided materials and point to the resume link if available. Do NOT use world knowledge, training data, or guess missing facts. " +
    "For cost/efficiency questions, you may infer potential savings from performance/observability work when that evidence is in context; do not claim explicit savings or numbers unless stated. " +
    "Link policy: ONLY use links from the provided allowed-link list; if nothing fits, omit the link instead of inventing one. " +
    "If the user's prompt is unprofessional (profanity, harassment, NSFW, threats, trolling) OR asks about personal traits (e.g., gender/sexual orientation/age/location/salary/PII) OR fringe/anonymous boards (e.g., 4chan), return exactly the token FLAG_NO_FUN and no other text. For normal prompts, never include FLAG_NO_FUN.";

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt }
  ];

  if (safeIntent) {
    messages.push({
      role: "system",
      content:
        "Safe-intent hint: this is a standard recruiting/portfolio question about Jack. Answer normally; do NOT return FLAG_NO_FUN."
    });
  }

  const retryNote = retryHint ? `\n\nRetry note: ${retryHint}` : "";
  const skillHint = skillStrengthQuestion
    ? "Focus on Jack's core software strengths: React, TypeScript, JavaScript, Node/Next.js, accessibility, performance/reliability, plus leadership/mentoring (Rollodex project and TA/mentorship work). Ignore fabrication or BAM logistics unless explicitly asked."
    : "";

  messages.push(
    ...trimmedHistory,
    {
      role: "user",
      content:
        `Locale: ${locale}. Stay concise (2–5 sentences). Do not include raw URLs in the reply body. ` +
        `Retrieved context:\n${retryHint ? shortContextBlock : contextBlock}\n\n` +
        `Allowed links (use only these URLs, or none):\n${allowedLinks || "- none"}\n\n` +
        `Answer ONLY using the retrieved context above and allowed links. If the answer is not in that context, say it is not available in the provided materials and point to the resume link if present; do not guess or rely on any outside knowledge. ` +
        `For cost/efficiency questions, you may connect performance/observability work to potential savings when that evidence is in context; avoid claiming explicit savings or numbers. ` +
        (skillHint ? `${skillHint} ` : "") +
        `If the request is unprofessional or personal (e.g., harassment, slurs, NSFW, threats, fringe/anonymous boards like 4chan, personal traits like gender/sexual orientation/age/location/salary/birth date, or seems about a different "Jack"), return exactly FLAG_NO_FUN and nothing else.\n\n` +
        `Question: ${question}${retryNote}`
    }
  );

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "X-Title": "Portfolio Chatbot"
  };

  if (referer) {
    headers["HTTP-Referer"] = referer;
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 1600
      })
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      console.error(
        "[chatbot] OpenRouter request failed",
        response.status,
        response.statusText,
        errorBody?.slice(0, 200)
      );
      return null;
    }

    const payload = await response.json();
    const choice = payload?.choices?.[0];
    const content = extractMessageContent(choice);
    const trimmed = content.trim();
    const finishReason = typeof choice?.finish_reason === "string" ? choice.finish_reason : undefined;
    const actualModel = typeof payload?.model === "string" ? payload.model : undefined;

    if (!trimmed) {
      console.warn(
        "[chatbot] OpenRouter returned empty content",
        { finishReason, actualModel }
      );
      return null;
    }

    return { text: trimmed, model: actualModel, finishReason };
  } catch (error) {
    console.error("[chatbot] OpenRouter request threw:", error);
    return null;
  }
}

async function moderateWithOpenRouter(
  request: Request,
  normalizedMessage: string,
  reasons: string[],
  professionalIntent: boolean,
  suspicionScore: number
): Promise<ModerationDecision | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn("[chatbot] Missing OPENROUTER_API_KEY; moderation unavailable.");
    return null;
  }

  const model =
    process.env.OPENROUTER_MODERATION_MODEL ??
    process.env.OPENROUTER_MODEL ??
    "openrouter/auto";
  const referer = resolveReferer(request);
  const intentHint = professionalIntent
    ? '{ "intent": "professional/tech Q&A about Jack\'s skills" }'
    : '{ "intent": "unspecified" }';
  const systemPrompt =
    "Portfolio chatbot safety check. Safe topics include: Jack's identity/role, skills, tech stack, projects, experience, " +
    "availability/timezone, role preferences (remote/contract/relocation), start timeline, contact/resume/GitHub/LinkedIn, " +
    "and site meta questions (analytics/cookies, what the chatbot can answer). " +
    "Block only harassment/trolling, profanity/slurs, sexual innuendo or explicit body parts, requests to expose non-public personal data (addresses/IDs/phone/coordinates), or self-harm/violence encouragement. " +
    "Be lenient with neutral professional words like \"broad experience\" or \"love working with React\" when not sexual. " +
    'Return strict JSON only with fields {"label": LABEL, "confidence": 0-1, "reason": "short"}. ' +
    "Labels: SAFE, PROFANITY, HARASSMENT_OR_TROLLING, SEXUAL_INNUENDO, PRIVACY/DOXXING, SELF_HARM/VIOLENCE, OTHER_UNSAFE. " +
    "If uncertain, lower the confidence instead of blocking. Never include extra text.";

  const userContent =
    `User message (normalized): ${normalizedMessage.slice(0, 600)}\n` +
    `Intent hint: ${intentHint}\n` +
    `Local cues: ${reasons.join(", ") || "none"}\n` +
    `Suspicion score: ${suspicionScore.toFixed(2)}\n` +
    "Return only the JSON payload.";

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "X-Title": "Portfolio Chatbot Moderation"
  };

  if (referer) {
    headers["HTTP-Referer"] = referer;
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent.slice(0, 1500) }
        ],
        temperature: 0,
        top_p: 0.1,
        max_tokens: 120
      })
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      console.error(
        "[chatbot] OpenRouter moderation failed",
        response.status,
        response.statusText,
        errorBody?.slice(0, 200)
      );
      return null;
    }

    const payload = await response.json();
    const choice = payload?.choices?.[0];
    const content = extractMessageContent(choice);
    const trimmed = content?.trim();

    if (!trimmed) {
      console.warn("[chatbot] Empty moderation response");
      return null;
    }

    let parsed: unknown = null;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      parsed = null;
    }

    const parsedObject = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
    const label = normalizeModerationLabel(
      typeof parsedObject?.label === "string" ? parsedObject.label : trimmed
    );
    const confidence = clampConfidence(
      typeof parsedObject?.confidence === "number"
        ? parsedObject.confidence
        : typeof parsedObject?.score === "number"
        ? parsedObject.score
        : typeof parsedObject?.probability === "number"
        ? parsedObject.probability
        : undefined
    );
    const reason = typeof parsedObject?.reason === "string" ? parsedObject.reason : undefined;
    const finishReason = typeof choice?.finish_reason === "string" ? choice.finish_reason : undefined;
    const actualModel = typeof payload?.model === "string" ? payload.model : undefined;

    return {
      label,
      confidence,
      model: actualModel,
      finishReason,
      raw: trimmed,
      reason
    };
  } catch (error) {
    console.error("[chatbot] OpenRouter moderation request threw:", error);
    return null;
  }
}

async function parseBody(request: Request): Promise<ChatRequestBody | null> {
  try {
    const payload = await request.json();
    return payload as ChatRequestBody;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const body = await parseBody(request);
  if (!body?.message) {
    return NextResponse.json(
      { error: "Invalid payload" },
      { status: 400 }
    );
  }

  const locale = isLocale(body.locale) ? (body.locale as Locale) : defaultLocale;
  const copy = getDictionary(locale).chatbot;
  const sessionId = ensureSessionId(body.sessionId);
  const ip = getClientIp(request);

  const trimmedMessage = sanitizeText(body.message).slice(0, MAX_INPUT_LENGTH);

  const sessionHash = hashValue(sessionId);
  const ipHash = hashValue(ip);

  const hasOpenRouterKey = Boolean(process.env.OPENROUTER_API_KEY);
  const promptCount = sessionPromptCounts.get(sessionId) ?? 0;
  const requireCaptcha = shouldRequireCaptcha(sessionId, promptCount);
  const captchaSiteKey = process.env.HCAPTCHA_SITE_KEY ?? "";

  if (requireCaptcha) {
    if (!captchaSiteKey || !process.env.HCAPTCHA_SECRET_KEY) {
      console.error("[chatbot] Captcha required but hCaptcha keys are not configured.");
      return NextResponse.json(
        {
          error: "captcha_unavailable",
          message: "Captcha is not configured. Please try again later."
        },
        { status: 500 }
      );
    }

    if (!body.captchaToken) {
      return NextResponse.json(
        {
          error: "captcha_required",
          message: copy.captchaPrompt,
          captchaRequired: true,
          captchaSiteKey,
          promptCount
        },
        { status: 403 }
      );
    }

    const validation = await verifyHCaptchaToken(body.captchaToken, ip);
    if (!validation.success) {
      const isProviderDown =
        validation.reason === "captcha_network_error" || validation.reason === "captcha_verify_failed";

      return NextResponse.json(
        {
          error: validation.reason ?? "captcha_invalid",
          message: isProviderDown
            ? copy.captchaServiceUnavailable
            : copy.captchaValidationFailed,
          captchaRequired: !isProviderDown,
          captchaSiteKey: isProviderDown ? undefined : captchaSiteKey,
          promptCount
        },
        { status: isProviderDown ? 503 : 403 }
      );
    }

    captchaSolved.set(sessionId, Date.now() + CAPTCHA_SOLVED_TTL_MS);
  }

  const rate = enforceRateLimit(ip);
  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message: "Rate limit reached. Try again soon.",
        retryAfterMs: rate.retryAfterMs
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((rate.retryAfterMs ?? 0) / 1000).toString()
        }
      }
    );
  }

  const structuralBenign = isBenignStructuralPrompt(trimmedMessage);
  const availabilityQuestion = isAvailabilityQuestion(trimmedMessage);
  const skillStrengthQuestion = isSkillStrengthQuestion(trimmedMessage);
  if (structuralBenign) {
    const reply = "I can help with Jack's roles, skills, projects, and availability.";
    sessionPromptCounts.set(sessionId, promptCount + 1);

    await logChatEvent(
      "chat.response",
      buildChatLogPayload({
        session: sessionHash,
        ip: ipHash,
        promptCount: promptCount + 1,
        locale,
        rateLimitRemaining: rate.remaining,
        message: trimmedMessage,
        reply,
        references: [],
        usedFallback: true,
        unprofessional: false,
        pass1Blocked: false,
        pass2Ran: false,
        moderation: {
          label: "safe",
          reason: "structural_bypass",
          localReasons: ["structural_bypass"],
          glinMatches: [],
          languages: [],
          downgraded: false,
          professionalIntent: false,
          suspicionScore: 0,
          usedOpenRouter: false
        }
      })
    );

    return NextResponse.json(
      {
        reply,
        references: [],
        usedFallback: true,
        promptCount: promptCount + 1,
        rateLimitRemaining: rate.remaining,
        captchaRequired: false,
        unprofessional: false,
        notice: "This chat is monitored for quality assurance purposes."
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }

  if (!trimmedMessage) {
    return NextResponse.json(
      { error: "Empty message" },
      { status: 400 }
    );
  }

  const localModeration = runLocalModeration(trimmedMessage);
  let moderationDecision: ModerationDecision | null = null;
  let moderationEffectiveLabel: ModerationLabel = "safe";
  let moderationDowngraded = false;
  let shouldBlockModeration = false;
  let moderationModelLabel: ModerationLabel | undefined;
  const safePhraseBypass = localModeration.reasons.includes("safe_phrase");
  const shouldModerate = hasOpenRouterKey && !structuralBenign && !safePhraseBypass;

  if (shouldModerate) {
    moderationDecision = await moderateWithOpenRouter(
      request,
      localModeration.normalized,
      localModeration.reasons,
      localModeration.professionalIntent,
      localModeration.suspicionScore
    );

    const outcome = computeModerationOutcome(moderationDecision, localModeration, localModeration.suspicionScore);
    moderationEffectiveLabel = outcome.effectiveLabel;
    shouldBlockModeration = outcome.shouldBlock;
    moderationDowngraded = outcome.downgraded;
    moderationModelLabel = outcome.decisionLabel ?? moderationDecision?.label;

    if (
      !shouldBlockModeration &&
      !localModeration.professionalIntent &&
      moderationEffectiveLabel === "safe" &&
      localModeration.suspicionScore >= 0.15
    ) {
      moderationEffectiveLabel = "other_unsafe";
      shouldBlockModeration = true;
    }

    if (
      shouldBlockModeration &&
      moderationEffectiveLabel === "privacy_or_doxxing" &&
      localModeration.professionalIntent &&
      isBenignLocationQuestion(localModeration.normalized)
    ) {
      moderationEffectiveLabel = "safe";
      shouldBlockModeration = false;
      moderationDowngraded = true;
    }

    if (shouldBlockModeration) {
      const reply = "Let's keep this chat professional. I can share Jack's skills, projects, and availability.";
      sessionPromptCounts.set(sessionId, promptCount + 1);

      await logChatEvent(
        "chat.response",
        buildChatLogPayload({
          session: sessionHash,
          ip: ipHash,
        promptCount: promptCount + 1,
        locale,
        rateLimitRemaining: rate.remaining,
        message: trimmedMessage,
        reply,
        references: [],
        usedFallback: true,
        unprofessional: true,
        pass1Blocked: true,
        pass2Ran: false,
        model: moderationDecision?.model ?? "moderation-block",
        modelReplyRaw: moderationDecision?.raw ?? "FLAG_NO_FUN (moderation-block)",
        finishReason: moderationDecision?.finishReason ?? "blocked",
        moderation: {
            label: moderationEffectiveLabel ?? "blocked",
            modelLabel: moderationModelLabel,
            confidence: moderationDecision?.confidence,
            reason: moderationDecision?.reason,
            localReasons: localModeration.reasons,
            glinMatches: localModeration.glinMatches,
            languages: localModeration.languagesTried,
            downgraded: moderationDowngraded,
            suspicionScore: localModeration.suspicionScore,
            usedOpenRouter: true
          }
        })
      );

      return NextResponse.json(
        {
          reply,
          references: [],
          usedFallback: true,
          promptCount: promptCount + 1,
          rateLimitRemaining: rate.remaining,
          captchaRequired: false,
          unprofessional: true,
          notice: "This chat is monitored for quality assurance purposes."
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store"
          }
        }
      );
    }
  } else {
    const deriveLocalLabel = (): ModerationLabel => {
      if (localModeration.selfHarmCue) return "self_harm_or_violence";
      if (localModeration.reasons.includes("doxxing")) return "privacy_or_doxxing";
      if (localModeration.reasons.includes("sexual_body")) return "sexual_innuendo";
      if (localModeration.reasons.includes("harassment")) return "harassment_or_trolling";
      if (localModeration.reasons.includes("glin")) return "profanity";
      return "safe";
    };

    moderationEffectiveLabel = deriveLocalLabel();
    const severeLocal =
      localModeration.selfHarmCue ||
      localModeration.reasons.includes("doxxing") ||
      localModeration.reasons.includes("sexual_body");
    shouldBlockModeration = severeLocal;

    if (shouldBlockModeration) {
      const reply = "Let's keep this chat professional. I can share Jack's skills, projects, and availability.";
      sessionPromptCounts.set(sessionId, promptCount + 1);

      await logChatEvent(
        "chat.response",
        buildChatLogPayload({
          session: sessionHash,
          ip: ipHash,
        promptCount: promptCount + 1,
        locale,
        rateLimitRemaining: rate.remaining,
        message: trimmedMessage,
        reply,
        references: [],
        usedFallback: true,
        unprofessional: true,
        pass1Blocked: true,
        pass2Ran: false,
        model: "moderation-block",
        modelReplyRaw: "FLAG_NO_FUN (local-moderation)",
        finishReason: "blocked",
        moderation: {
            label: moderationEffectiveLabel ?? "blocked",
            modelLabel: moderationModelLabel,
            reason: "local_fallback_block",
            localReasons: localModeration.reasons,
            glinMatches: localModeration.glinMatches,
            languages: localModeration.languagesTried,
            downgraded: moderationDowngraded,
            suspicionScore: localModeration.suspicionScore,
            usedOpenRouter: false
          }
        })
      );

      return NextResponse.json(
        {
          reply,
          references: [],
          usedFallback: true,
          promptCount: promptCount + 1,
          rateLimitRemaining: rate.remaining,
          captchaRequired: false,
          unprofessional: true,
          notice: "This chat is monitored for quality assurance purposes."
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store"
          }
        }
      );
    }
  }

  const moderationMeta = {
    label: moderationEffectiveLabel,
    modelLabel: moderationModelLabel,
    confidence: moderationDecision?.confidence,
    reason: moderationDecision?.reason,
    localReasons: localModeration.reasons,
    glinMatches: localModeration.glinMatches,
    languages: localModeration.languagesTried,
    raw: moderationDecision?.raw,
    downgraded: moderationDowngraded,
    professionalIntent: localModeration.professionalIntent,
    suspicionScore: localModeration.suspicionScore,
    usedOpenRouter: shouldModerate
  };

  const resources = await loadChatResources();
  const retrievalLimit = skillStrengthQuestion ? 10 : availabilityQuestion ? 8 : 6;
  const hits = await retrieveContext(trimmedMessage, locale, retrievalLimit);
  const history = summarizeHistory(body.history ?? []);
  const workEduQuestion = isWorkEducationQuestion(trimmedMessage);
  const workEducationFacts = workEduQuestion
    ? await buildWorkEducationFacts(trimmedMessage, locale, resources.index, 5)
    : [];

  const selectedModel = process.env.OPENROUTER_MODEL ?? "openrouter/auto";

  let filteredHits = hits;
  if (workEduQuestion) {
    if (isResumeOnlyQuestion(trimmedMessage)) {
      const resumeHits = hits.filter((hit) => hit.chunk.href.startsWith("/resume.pdf"));
      if (resumeHits.length) {
        filteredHits = resumeHits;
      }
    } else {
      const preferred = hits.filter((hit) =>
        hit.chunk.sourceType === "experience" ||
        hit.chunk.sourceType === "education" ||
        hit.chunk.sourceType === "resume"
      );
      if (preferred.length) {
        filteredHits = preferred;
      }
    }
  }

  if (skillStrengthQuestion) {
    let narrowed = filteredHits.filter((hit) => hit.chunk.sourceType === "tech" || hit.chunk.sourceType === "resume");
    const experienceAdds = filteredHits.filter(
      (hit) =>
        hit.chunk.sourceType === "experience" &&
        SKILL_INCLUDE_EXPERIENCE_PATTERNS.some((pattern) => pattern.test(hit.chunk.title) || pattern.test(hit.chunk.text))
    );
    narrowed = [...narrowed, ...experienceAdds].filter(
      (hit, index, arr) => arr.findIndex((h) => h.chunk.id === hit.chunk.id) === index
    );
    narrowed = narrowed.filter((hit) => !SKILL_EXCLUDE_PATTERNS.some((pattern) => pattern.test(hit.chunk.text)));
    if (narrowed.length > 0) {
      filteredHits = narrowed;
    } else {
      const resumeChunk = resources.index.chunks.find((chunk) => chunk.id === "resume-resume-profile");
      if (resumeChunk) {
        filteredHits = [{ chunk: resumeChunk, score: 1 }];
      }
    }
  }

  let references = buildReferences(filteredHits, resources.anchors);
  const referenceHrefs = new Set(references.map((ref) => ref.href));
  const availabilityAnchor = findAnchorByCategory(resources.anchors, "availability", locale);
  const resumeAnchor = findAnchorByCategory(resources.anchors, "resume", locale);
  if (availabilityQuestion) {
    if (availabilityAnchor && !references.some((ref) => ref.href === availabilityAnchor.href)) {
      references = [anchorToReference(availabilityAnchor), ...references];
      referenceHrefs.add(availabilityAnchor.href);
    }
  }
  if (skillStrengthQuestion && resumeAnchor && !references.some((ref) => ref.href === resumeAnchor.href)) {
    references = [anchorToReference(resumeAnchor), ...references];
    referenceHrefs.add(resumeAnchor.href);
  }

  const safeIntent = safePhraseBypass || localModeration.professionalIntent;
  let repromptAttempted = false;
  let modelReply = await callOpenRouter(
    request,
    resources.instructions,
    trimmedMessage,
    locale,
    filteredHits,
    history,
    resources.anchors,
    safeIntent
  );

  if (!modelReply?.text?.trim()) {
    repromptAttempted = true;
    modelReply = await callOpenRouter(
      request,
      resources.instructions,
      trimmedMessage,
      locale,
      filteredHits,
      history,
      resources.anchors,
      safeIntent,
      "Previous model response was empty. Provide a 2–5 sentence answer with allowed links; do not return blank content."
    );
  }

  const rawReplyText = modelReply?.text?.trim() || null;
  const { text: cleanedReply, flagged: noFunFlagFromModel } = rawReplyText
    ? stripNoFunFlag(rawReplyText)
    : { text: rawReplyText, flagged: false };
  const resolvedReplyText =
    cleanedReply && cleanedReply.trim().length > 0
      ? normalizeParens(
          stripRawUrls(stripBracketedUrls(ensureLinkSpacing(applyBrandCorrections(cleanedReply))))
        )
      : null;
  const meetingHref = resources.anchors.find((anchor) => anchor.category === "availability" && anchor.locale === locale)?.href;
  const driftedPersona =
    resolvedReplyText && WRONG_PERSONA_PATTERNS.some((pattern) => pattern.test(resolvedReplyText));
  const shouldForceMeetings =
    availabilityQuestion &&
    meetingHref &&
    (!resolvedReplyText || !resolvedReplyText.toLowerCase().includes("/meetings"));
  const techAnchorAdds = findTechAnchorsForKeywords(resolvedReplyText, resources.anchors, locale, referenceHrefs);
  if (techAnchorAdds.length > 0) {
    references = [...techAnchorAdds.map(anchorToReference), ...references];
  } else if (skillStrengthQuestion) {
    const fallbackRefs = findAnchorsByIds(
      resources.anchors,
      ["react", "typescript", "javascript"],
      locale,
      referenceHrefs
    );
    if (fallbackRefs.length > 0) {
      references = [...fallbackRefs.map(anchorToReference), ...references];
    }
    if (resumeAnchor && !referenceHrefs.has(resumeAnchor.href)) {
      references = [anchorToReference(resumeAnchor), ...references];
      referenceHrefs.add(resumeAnchor.href);
    }
  }

  const inlineLinks = extractInlineLinks(resolvedReplyText);
  for (const link of inlineLinks) {
    if (referenceHrefs.has(link.href)) {
      continue;
    }
    const anchor = findAnchorByHref(resources.anchors, link.href, locale);
    const title = anchor?.name ?? (link.text?.trim() || link.href);
    references = [{ title, href: link.href }, ...references];
    referenceHrefs.add(link.href);
  }

  references = references
    .map((ref) => {
      const href = typeof ref?.href === "string" ? ref.href : "";
      if (!href) return null;
      const title =
        typeof ref?.title === "string" && ref.title.trim().length > 0 ? ref.title.trim() : href;
      return { title, href };
    })
    .filter((ref): ref is { title: string; href: string } => Boolean(ref));

  const shouldForceSkills = false;
  const shouldEnforceNoFun = noFunFlagFromModel;

  let reply: string;
  const usedFallback =
    resolvedReplyText === null || shouldEnforceNoFun || driftedPersona || shouldForceMeetings || shouldForceSkills;

  if (!usedFallback) {
    reply = resolvedReplyText!;
  } else if (shouldForceMeetings && meetingHref) {
    reply = applyBrandCorrections(`You can view Jack's current availability and book a time here: ${meetingHref}`);
  } else {
    reply = applyBrandCorrections(
      "Let's keep this chat professional. I can share Jack's skills, projects, and availability."
    );
  }

  sessionPromptCounts.set(sessionId, promptCount + 1);

  await logChatEvent(
    "chat.response",
    buildChatLogPayload({
      session: sessionHash,
      ip: ipHash,
      promptCount: promptCount + 1,
      locale,
      rateLimitRemaining: rate.remaining,
      message: trimmedMessage,
      reply,
      references,
      contextFacts: workEducationFacts,
      usedFallback,
      unprofessional: shouldEnforceNoFun,
      pass1Blocked: false,
      pass2Ran: true,
      model: modelReply?.model ?? selectedModel,
      modelReplyRaw: rawReplyText,
      finishReason: modelReply?.finishReason,
      moderation: moderationMeta,
      extras: {
        contextFacts: workEducationFacts
      }
    })
  );

  const responsePayload = {
    reply,
    references,
    contextFacts: workEducationFacts,
    usedFallback,
    promptCount: promptCount + 1,
    rateLimitRemaining: rate.remaining,
    captchaRequired: false,
    unprofessional: shouldEnforceNoFun,
    notice: "This chat is monitored for quality assurance purposes.",
    ...(process.env.NODE_ENV !== "production"
      ? {
          debug: {
            openRouterApiKeyPresent: hasOpenRouterKey,
            model: selectedModel,
            usedFallback,
            repromptAttempted,
            moderation: moderationMeta
          }
        }
      : {})
  };

  return NextResponse.json(responsePayload, {
    status: 200,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
