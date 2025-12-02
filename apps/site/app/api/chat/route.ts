import crypto from "node:crypto";
import { NextResponse } from "next/server";

import {
  buildContextBlock,
  buildReferences,
  loadChatResources,
  retrieveContext,
  sanitizeText,
  type RetrievalHit
} from "../../../src/lib/ai/chatbot";
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

const MAX_INPUT_LENGTH = 1200;
const MAX_HISTORY = 6;
const MAX_PROMPTS_PER_HOUR = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const CAPTCHA_THRESHOLD = 2; // Require captcha starting at the 3rd prompt
const CAPTCHA_TTL_MS = 10 * 60 * 1000;
const CAPTCHA_SOLVED_TTL_MS = 60 * 60 * 1000;

const rateLimitBuckets = new Map<string, number[]>();
const sessionPromptCounts = new Map<string, number>();
const captchaChallenges = new Map<
  string,
  { code: string; expiresAt: number; solvedUntil?: number; pendingMessage?: string }
>();

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

function needsCaptcha(sessionId: string): boolean {
  const count = sessionPromptCounts.get(sessionId) ?? 0;
  if (count < CAPTCHA_THRESHOLD) {
    return false;
  }

  const state = captchaChallenges.get(sessionId);
  if (state?.solvedUntil && state.solvedUntil > Date.now()) {
    return false;
  }

  return true;
}

function issueCaptchaChallenge(sessionId: string) {
  const code = Math.random().toString(36).slice(-6).toUpperCase();
  const challenge = {
    code,
    expiresAt: Date.now() + CAPTCHA_TTL_MS
  };
  captchaChallenges.set(sessionId, challenge);
  return challenge;
}

function validateCaptcha(sessionId: string, token?: string) {
  const state = captchaChallenges.get(sessionId);
  if (!state || state.expiresAt < Date.now()) {
    return { valid: false, challenge: issueCaptchaChallenge(sessionId) };
  }

  if (!token) {
    return { valid: false, challenge: state };
  }

  if (state.code !== token.trim().toUpperCase()) {
    return { valid: false, challenge: state };
  }

  captchaChallenges.set(sessionId, {
    ...state,
    solvedUntil: Date.now() + CAPTCHA_SOLVED_TTL_MS,
    pendingMessage: undefined
  });

  return { valid: true };
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
  instructions: string,
  question: string,
  locale: Locale,
  hits: RetrievalHit[],
  history: ChatMessage[]
): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return null;
  }

  const model =
    process.env.OPENROUTER_MODEL ??
    "openrouter/anthropic/claude-3-haiku-20240307";

  const contextBlock = buildContextBlock(hits);
  const trimmedHistory = summarizeHistory(history);

  const systemPrompt =
    `${instructions.trim()}\n\n` +
    "Operate as Jack's recruiter-facing assistant. Keep replies concise (2–5 sentences), " +
    "lead with a confident yes/solution, ground claims in the provided context, include links, " +
    "stay professional, avoid salary/PII, and mention the logging notice when relevant.";

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt }
  ];

  messages.push(
    ...trimmedHistory,
    {
      role: "user",
      content:
        `Locale: ${locale}. Use markdown links for references. Stay concise (2–5 sentences). ` +
        `Retrieved context:\n${contextBlock}\n\nQuestion: ${question}`
    }
  );

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 320
      })
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    const content: string | undefined = payload?.choices?.[0]?.message?.content;
    return typeof content === "string" ? content : null;
  } catch {
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

  if (needsCaptcha(sessionId)) {
    const validation = validateCaptcha(sessionId, body.captchaToken);
    if (!validation.valid) {
      captchaChallenges.set(sessionId, {
        code: validation.challenge?.code ?? "",
        expiresAt: validation.challenge?.expiresAt ?? Date.now() + CAPTCHA_TTL_MS,
        pendingMessage: trimmedMessage
      });

      return NextResponse.json(
        {
          error: "captcha_required",
          message: "Please solve the captcha to continue.",
          captchaRequired: true,
          captchaChallenge: validation.challenge?.code,
          promptCount: sessionPromptCounts.get(sessionId) ?? 0
        },
        { status: 403 }
      );
    }
  }

  const promptCount = sessionPromptCounts.get(sessionId) ?? 0;
  const resources = await loadChatResources();
  const hits = await retrieveContext(trimmedMessage, locale, 5);
  const references = buildReferences(hits, resources.anchors);
  const history = summarizeHistory(body.history ?? []);

  const modelReply = await callOpenRouter(
    resources.instructions,
    trimmedMessage,
    locale,
    hits,
    history
  );
  const reply = modelReply ?? buildFallbackReply(locale, hits, references);
  const usedFallback = modelReply === null;

  sessionPromptCounts.set(sessionId, promptCount + 1);

  const responsePayload = {
    reply,
    references,
    usedFallback,
    promptCount: promptCount + 1,
    rateLimitRemaining: rate.remaining,
    captchaRequired: false,
    notice: "This chat is monitored for quality assurance purposes."
  };

  return NextResponse.json(responsePayload, {
    status: 200,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
