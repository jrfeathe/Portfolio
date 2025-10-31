import { webcrypto } from "crypto";
import type { NextRequest } from "next/server";

import {
  applySecurityHeaders,
  buildContentSecurityPolicy,
  generateNonce
} from "./headers";

function createRequest(url: string) {
  return {
    nextUrl: new URL(url)
  } as unknown as NextRequest;
}

function runWithNodeEnv(env: string, callback: () => void) {
  const mutableEnv = process.env as Record<string, string | undefined>;
  const originalEnv = mutableEnv.NODE_ENV;

  mutableEnv.NODE_ENV = env;

  try {
    callback();
  } finally {
    mutableEnv.NODE_ENV = originalEnv;
  }
}

beforeAll(() => {
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: webcrypto
  });
});

describe("security headers helpers", () => {
  it("generates base64 nonces", () => {
    const nonce = generateNonce();

    expect(typeof nonce).toBe("string");
    expect(nonce).toMatch(/^[A-Za-z0-9+/=]+$/);
  });

  it("builds a CSP containing the provided nonce", () => {
    const nonce = "testnonce";
    const csp = buildContentSecurityPolicy(nonce);

    expect(csp).toContain(`script-src 'self' 'nonce-${nonce}'`);
    if (process.env.NODE_ENV === "production") {
      expect(csp).toContain(`style-src 'self' 'nonce-${nonce}'`);
    } else {
      expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    }
    expect(csp).toContain("default-src 'self'");
    if (process.env.NODE_ENV !== "production") {
      expect(csp).toContain("'unsafe-eval'");
    }
    expect(csp.endsWith("upgrade-insecure-requests")).toBe(true);
  });

  it("omits unsafe-eval in production mode", () => {
    runWithNodeEnv("production", () => {
      const csp = buildContentSecurityPolicy("prod");
      expect(csp).not.toContain("'unsafe-eval'");
      expect(csp).not.toContain("'unsafe-inline'");
      expect(csp).toContain("style-src 'self' 'nonce-prod'");
    });
  });

  it("applies the full header set", () => {
    const nonce = "abc123";
    const headers = new Headers();
    const request = createRequest("https://example.com");

    applySecurityHeaders(headers, { nonce, request });

    expect(headers.get("Content-Security-Policy")).toContain(
      `'nonce-${nonce}'`
    );
    expect(headers.get("Permissions-Policy")).toBeTruthy();
    expect(headers.get("Strict-Transport-Security")).toBeTruthy();
    expect(headers.get("X-Frame-Options")).toBe("DENY");
  });

  it("omits HSTS on non-HTTPS requests", () => {
    const headers = new Headers();
    const request = createRequest("http://localhost:3000");

    applySecurityHeaders(headers, { nonce: "nonce", request });

    expect(headers.get("Strict-Transport-Security")).toBeNull();
  });
});
