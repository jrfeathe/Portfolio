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
  type AnchorEntry
} from "../../../src/lib/ai/chatbot";
import { runLocalModeration } from "../../../src/lib/ai/moderation";
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

function enforceRateLimit(key: string) {
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
  return history
    .slice(-MAX_HISTORY)
    .filter((entry) => entry.role === "user" || entry.role === "assistant")
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
    console.log(JSON.stringify(entry));
  } catch {
    // Swallow logging errors
  }
  await writeChatLog(entry);
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

function extractMessageContent(choice: any): string {
  const message = choice?.message;
  if (!message) {
    return "";
  }

  const content = (message as any).content;
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }
        if (typeof part?.text === "string") {
          return part.text;
        }
        return "";
      })
      .join("")
      .trim();
  }

  if (typeof (message as any).text === "string") {
    return (message as any).text;
  }

  return "";
}

function stripNoFunFlag(text: string): { text: string; flagged: boolean } {
  const flagRegex = /\bFLAG_NO_FUN\b/i;
  if (!flagRegex.test(text)) {
    return { text, flagged: false };
  }
  const cleaned = text.replace(flagRegex, "").trim();
  return { text: cleaned || null, flagged: true };
}

function applyBrandCorrections(text: string): string {
  return BRAND_CORRECTIONS.reduce((current, rule) => current.replace(rule.pattern, rule.replacement), text);
}

function ensureLinkSpacing(text: string): string {
  // Insert a space before markdown links that are jammed against the previous word.
  return text.replace(/([A-Za-z0-9])(\[([^\]]+)\]\([^)]+\))/g, "$1 $2");
}

function stripMarkdownLinks(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [text](url) -> text
    .replace(/\[([^\]]+)\]\s*\[[^\]]*\]/g, "$1"); // [text][ref] -> text
}

function stripBracketedUrls(text: string): string {
  return text.replace(/\s*\[[^\]]*(?:https?:\/\/|\/)[^\]]*\]/g, "");
}

function normalizeParens(text: string): string {
  return text.replace(/\)\s*\)/g, ")").trim();
}

function isWorkEducationQuestion(message: string): boolean {
  return WORK_EDU_PATTERNS.some((pattern) => pattern.test(message));
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

function buildFallbackReply(
  locale: Locale,
  hits: RetrievalHit[],
  references: Array<{ title: string; href: string }>
) {
  if (!hits.length) {
    const resumeHref = references.find((ref) => ref.title.toLowerCase().includes("resume"))?.href;
    return (
      `I'm having trouble reaching the model right now, but you can review Jack's resume here: ${resumeHref ?? "/resume.pdf"}. ` +
      "For specific questions, include the tech or project name and I will try again."
    );
  }

  const top = hits[0].chunk;
  const pointer = references[0]?.href ?? top.href;
  return `Yes. Based on the available context (${top.title}), Jack can help here. ` +
    `See ${pointer} for details. If you need more depth, ask a follow-up and I'll fetch a richer answer.`;
}

async function callOpenRouter(
  request: Request,
  instructions: string,
  question: string,
  locale: Locale,
  hits: RetrievalHit[],
  history: ChatMessage[],
  anchors: AnchorEntry[],
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

  const contextBlock = buildContextBlock(hits);
  const shortContextBlock = buildContextBlock(hits, { maxChunkChars: 260, maxItems: 2 });
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

  const allowedLinks = Array.from(allowedLinkSet.entries())
    .map(([href, title]) => `- ${title}: ${href}`)
    .join("\n");

  const systemPrompt =
    `${instructions.trim()}\n\n` +
    "Operate as Jack's recruiter-facing assistant. Keep replies concise (2–5 sentences), " +
    "lead with a confident yes/solution, ground claims in the provided context, include links, " +
    "stay professional, avoid salary/PII, and mention the logging notice when relevant. " +
    "Jack/He always refers to Jack Featherstone (software engineer, subject of this portfolio). Never answer about any other Jack. " +
    "Use ONLY the retrieved context snippets and the allowed-link list; if the answer is not in the provided context, say it is not available in the provided materials and point to the resume link if available. Do NOT use world knowledge, training data, or guess missing facts. " +
    "Link policy: ONLY use links from the provided allowed-link list; if nothing fits, omit the link instead of inventing one. " +
    "If the user's prompt is unprofessional (profanity, harassment, NSFW, threats, trolling) OR asks about personal traits (e.g., gender/sexual orientation/age/location/salary/PII) OR fringe/anonymous boards (e.g., 4chan), return exactly the token FLAG_NO_FUN and no other text. For normal prompts, never include FLAG_NO_FUN.";

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt }
  ];

  const retryNote = retryHint ? `\n\nRetry note: ${retryHint}` : "";

  messages.push(
    ...trimmedHistory,
    {
      role: "user",
      content:
        `Locale: ${locale}. Use markdown links for references. Stay concise (2–5 sentences). ` +
        `Retrieved context:\n${retryHint ? shortContextBlock : contextBlock}\n\n` +
        `Allowed links (use only these URLs, or none):\n${allowedLinks || "- none"}\n\n` +
        `Answer ONLY using the retrieved context above and allowed links. If the answer is not in that context, say it is not available in the provided materials and point to the resume link if present; do not guess or rely on any outside knowledge. ` +
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
        max_tokens: 800
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

type ModerationLabel =
  | "safe"
  | "profanity"
  | "harassment_or_trolling"
  | "sexual_innuendo"
  | "doxxing_or_privacy"
  | "self_harm_or_violence"
  | "other";

type ModerationDecision = {
  label: ModerationLabel;
  confidence?: number;
  model?: string;
  finishReason?: string;
  raw?: string;
  reason?: string;
};

function normalizeModerationLabel(value?: string): ModerationLabel {
  const normalized = (value ?? "").toLowerCase().replace(/[^a-z]+/g, "_");
  if (normalized.includes("safe")) return "safe";
  if (normalized.includes("profan")) return "profanity";
  if (normalized.includes("harass") || normalized.includes("troll")) return "harassment_or_trolling";
  if (normalized.includes("sexual") || normalized.includes("nsfw") || normalized.includes("innuendo")) {
    return "sexual_innuendo";
  }
  if (normalized.includes("dox") || normalized.includes("privacy")) return "doxxing_or_privacy";
  if (normalized.includes("self") || normalized.includes("harm") || normalized.includes("violence")) {
    return "self_harm_or_violence";
  }
  return "other";
}

function clampConfidence(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.min(1, Math.max(0, value));
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }
  return Math.min(1, Math.max(0, parsed));
}

async function moderateWithOpenRouter(
  request: Request,
  normalizedMessage: string,
  reasons: string[]
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
  const systemPrompt =
    "You are a content safety classifier. Given ONE user message, return JSON only with fields " +
    '"label" (one of: SAFE, PROFANITY, HARASSMENT_OR_TROLLING, SEXUAL_INNUENDO, DOXXING_OR_PRIVACY, SELF_HARM_OR_VIOLENCE, OTHER_UNSAFE), "confidence" (0-1), and "reason" (short string). ' +
    "Label DOXXING_OR_PRIVACY only when the user asks for non-public personal data (addresses, phone numbers, IDs, GPS coordinates) or shows harmful intent to expose someone. " +
    "Treat normal portfolio questions about public work history, school, employer, tech stack, location/timezone, or schedule as SAFE. " +
    "Do not return advice or free text—return JSON only.";

  const userContent =
    `User message:\n${normalizedMessage}\n\n` +
    `Hints: ${reasons.join(", ") || "none"}\n` +
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

    let parsed: any;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      parsed = null;
    }

    const label = normalizeModerationLabel(parsed?.label ?? trimmed);
    const confidence = clampConfidence(parsed?.confidence ?? parsed?.score ?? parsed?.probability);
    const reason = typeof parsed?.reason === "string" ? parsed.reason : undefined;
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
  const sessionId = ensureSessionId(body.sessionId);
  const ip = getClientIp(request);

  const trimmedMessage = sanitizeText(body.message).slice(0, MAX_INPUT_LENGTH);
  if (!trimmedMessage) {
    return NextResponse.json(
      { error: "Empty message" },
      { status: 400 }
    );
  }

  const sessionHash = hashValue(sessionId);
  const ipHash = hashValue(ip);

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

  const promptCount = sessionPromptCounts.get(sessionId) ?? 0;
  const localModeration = runLocalModeration(trimmedMessage);
  let moderationDecision: ModerationDecision | null = null;

  if (localModeration.flagged) {
    moderationDecision = await moderateWithOpenRouter(request, localModeration.normalized, localModeration.reasons);
    const unsafe = !moderationDecision || moderationDecision.label !== "safe";

    if (unsafe) {
      const reply = "Let's keep this chat professional. I can share Jack's skills, projects, and availability.";
      sessionPromptCounts.set(sessionId, promptCount + 1);

      await logChatEvent("chat.response", {
        session: sessionHash,
        ip: ipHash,
        promptCount: promptCount + 1,
        locale,
        usedFallback: true,
        unprofessional: true,
        modelReplyRaw: moderationDecision?.raw ?? "FLAG_NO_FUN (moderation-block)",
        model: moderationDecision?.model ?? "moderation-block",
        finishReason: moderationDecision?.finishReason ?? "blocked",
        rateLimitRemaining: rate.remaining,
        message: trimmedMessage,
        reply,
        references: [],
        moderationLabel: moderationDecision?.label ?? "blocked",
        moderationConfidence: moderationDecision?.confidence,
        moderationReason: moderationDecision?.reason,
        moderationLocalReasons: localModeration.reasons,
        moderationGlinMatches: localModeration.glinMatches,
        moderationLanguages: localModeration.languagesTried
      });

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

  const moderationMeta = localModeration.flagged
    ? {
        moderationLabel: moderationDecision?.label ?? "safe",
        moderationConfidence: moderationDecision?.confidence,
        moderationReason: moderationDecision?.reason,
        moderationLocalReasons: localModeration.reasons,
        moderationGlinMatches: localModeration.glinMatches,
        moderationLanguages: localModeration.languagesTried,
        moderationRaw: moderationDecision?.raw
      }
    : undefined;

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
          message: "Please complete the captcha to continue.",
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
            ? "Captcha service is unavailable right now. Please try again later."
            : "Captcha validation failed. Please try again.",
          captchaRequired: !isProviderDown,
          captchaSiteKey: isProviderDown ? undefined : captchaSiteKey,
          promptCount
        },
        { status: isProviderDown ? 503 : 403 }
      );
    }

    captchaSolved.set(sessionId, Date.now() + CAPTCHA_SOLVED_TTL_MS);
  }
  const resources = await loadChatResources();
  const hits = await retrieveContext(trimmedMessage, locale, 3);
  const history = summarizeHistory(body.history ?? []);
  const workEduQuestion = isWorkEducationQuestion(trimmedMessage);
  const workEducationFacts = workEduQuestion
    ? buildWorkEducationFacts(trimmedMessage, locale, resources.index, 5)
    : [];

  const hasOpenRouterKey = Boolean(process.env.OPENROUTER_API_KEY);
  const selectedModel = process.env.OPENROUTER_MODEL ?? "openrouter/auto";

  const filteredHits =
    workEduQuestion && hits.some((hit) => hit.chunk.href.startsWith("/resume.pdf"))
      ? hits.filter((hit) => hit.chunk.href.startsWith("/resume.pdf"))
      : hits;

  const references = buildReferences(filteredHits, resources.anchors);

  let repromptAttempted = false;
  let modelReply = await callOpenRouter(
    request,
    resources.instructions,
    trimmedMessage,
    locale,
    filteredHits,
    history,
    resources.anchors
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
      "Previous model response was empty. Provide a 2–5 sentence answer with allowed links; do not return blank content."
    );
  }

  const rawReplyText = modelReply?.text?.trim() || null;
  const { text: cleanedReply, flagged: noFunFlagFromModel } = rawReplyText
    ? stripNoFunFlag(rawReplyText)
    : { text: rawReplyText, flagged: false };
  const resolvedReplyText =
    cleanedReply && cleanedReply.trim().length > 0
      ? normalizeParens(stripBracketedUrls(ensureLinkSpacing(applyBrandCorrections(cleanedReply))))
      : null;
  const shouldEnforceNoFun = noFunFlagFromModel;
  const reply =
    resolvedReplyText && !shouldEnforceNoFun
      ? resolvedReplyText
      : applyBrandCorrections("Let's keep this chat professional. I can share Jack's skills, projects, and availability.");
  const usedFallback = resolvedReplyText === null || shouldEnforceNoFun;

  sessionPromptCounts.set(sessionId, promptCount + 1);

  await logChatEvent("chat.response", {
    session: sessionHash,
    ip: ipHash,
    promptCount: promptCount + 1,
    locale,
    usedFallback,
    unprofessional: shouldEnforceNoFun,
    modelReplyRaw: rawReplyText,
    model: modelReply?.model ?? selectedModel,
    finishReason: modelReply?.finishReason,
    rateLimitRemaining: rate.remaining,
    message: trimmedMessage,
    reply,
    references,
    contextFacts: workEducationFacts,
    ...(moderationMeta ?? {})
  });

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
