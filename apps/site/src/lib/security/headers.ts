import type { NextRequest } from "next/server";

export type SecurityHeadersOptions = {
  request: NextRequest;
};

const PERMISSIONS_POLICY =
  "accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=()";

const REFERRER_POLICY = "no-referrer";
const STRICT_TRANSPORT_SECURITY =
  "max-age=63072000; includeSubDomains; preload";
const X_CONTENT_TYPE_OPTIONS = "nosniff";
const X_FRAME_OPTIONS = "DENY";
const X_PERMITTED_CROSS_DOMAIN_POLICIES = "none";
const CROSS_ORIGIN_OPENER_POLICY = "same-origin";
const CROSS_ORIGIN_RESOURCE_POLICY = "same-origin";
const ORIGIN_AGENT_CLUSTER = "?1";

function arrayBufferToBase64(buffer: ArrayBuffer) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(buffer).toString("base64");
  }

  let binary = "";
  const bytes = new Uint8Array(buffer);

  for (let idx = 0; idx < bytes.byteLength; idx += 1) {
    binary += String.fromCharCode(bytes[idx]);
  }

  return btoa(binary);
}

export function generateNonce(byteLength = 16) {
  const cryptoImpl = globalThis.crypto;

  if (!cryptoImpl?.getRandomValues) {
    throw new Error("Cryptographic randomness is unavailable in this runtime.");
  }

  const array = new Uint8Array(byteLength);
  cryptoImpl.getRandomValues(array);

  return arrayBufferToBase64(array.buffer);
}

function buildScriptSrcDirective(allowHCaptcha: boolean) {
  const directives = [`'self'`, `'unsafe-inline'`];

  if (allowHCaptcha) {
    directives.push("https://js.hcaptcha.com");
  }

  if (process.env.NODE_ENV !== "production") {
    directives.push("'unsafe-eval'");
  }

  return `script-src ${directives.join(" ")}`;
}

function buildStyleSrcDirective() {
  return "style-src 'self' 'unsafe-inline'";
}

export function buildContentSecurityPolicy() {
  const allowHCaptcha = Boolean(process.env.HCAPTCHA_SITE_KEY);
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    allowHCaptcha
      ? "frame-src 'self' https://hcaptcha.com https://*.hcaptcha.com"
      : "frame-src 'none'",
    "manifest-src 'self'",
    "media-src 'self'",
    "font-src 'self' data:",
    "img-src 'self' data: blob: https:",
    "worker-src 'self' blob:",
    buildScriptSrcDirective(allowHCaptcha),
    buildStyleSrcDirective(),
    "style-src-attr 'unsafe-inline'",
    "connect-src 'self' https: wss:",
    "upgrade-insecure-requests"
  ];

  return directives.join("; ");
}

export function applySecurityHeaders(
  headers: Headers,
  { request }: SecurityHeadersOptions
) {
  headers.set("Content-Security-Policy", buildContentSecurityPolicy());
  headers.set("Permissions-Policy", PERMISSIONS_POLICY);
  headers.set("Referrer-Policy", REFERRER_POLICY);

  if (request.nextUrl.protocol === "https:") {
    headers.set("Strict-Transport-Security", STRICT_TRANSPORT_SECURITY);
  }

  headers.set("X-Content-Type-Options", X_CONTENT_TYPE_OPTIONS);
  headers.set("X-Frame-Options", X_FRAME_OPTIONS);
  headers.set("X-Permitted-Cross-Domain-Policies", X_PERMITTED_CROSS_DOMAIN_POLICIES);
  headers.set("Cross-Origin-Opener-Policy", CROSS_ORIGIN_OPENER_POLICY);
  headers.set("Cross-Origin-Resource-Policy", CROSS_ORIGIN_RESOURCE_POLICY);
  headers.set("Origin-Agent-Cluster", ORIGIN_AGENT_CLUSTER);
}
