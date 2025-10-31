import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  defaultLocale,
  isLocale,
  localeCookieName
} from "./utils/i18n";
import {
  registerEdgeInstrumentation,
  withEdgeSpan
} from "./lib/otel/edge";
import {
  applySecurityHeaders,
  generateNonce
} from "./lib/security/headers";

const PUBLIC_FILE = /\.(.*)$/;

function getLocaleFromPath(pathname: string) {
  const [, maybeLocale] = pathname.split("/");
  return maybeLocale;
}

export async function middleware(request: NextRequest) {
  await registerEdgeInstrumentation();

  return withEdgeSpan(request, "edge.middleware", () => {
    const { pathname } = request.nextUrl;

    if (
      pathname.startsWith("/_next") ||
      PUBLIC_FILE.test(pathname)
    ) {
      return NextResponse.next();
    }

    const nonce = generateNonce();
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("x-nextjs-csp-nonce", nonce);
    requestHeaders.set("x-csp-nonce", nonce);

    if (pathname.startsWith("/api")) {
      const apiResponse = NextResponse.next({
        request: {
          headers: requestHeaders
        }
      });
      applySecurityHeaders(apiResponse.headers, { nonce, request });
      apiResponse.headers.set("x-nonce", nonce);
      apiResponse.headers.set("x-nextjs-csp-nonce", nonce);
      apiResponse.headers.set("x-csp-nonce", nonce);
      return apiResponse;
    }

    const localeInPath = getLocaleFromPath(pathname);

    if (!isLocale(localeInPath)) {
      const redirectUrl = request.nextUrl.clone();
      const pathnameSuffix = pathname === "/" ? "" : pathname;
      redirectUrl.pathname = `/${defaultLocale}${pathnameSuffix}`;

      const response = NextResponse.redirect(redirectUrl);
      response.cookies.set(localeCookieName, defaultLocale, {
        path: "/",
        sameSite: "lax"
      });
      applySecurityHeaders(response.headers, { nonce, request });
      response.headers.set("x-nonce", nonce);
      response.headers.set("x-nextjs-csp-nonce", nonce);
      response.headers.set("x-csp-nonce", nonce);
      return response;
    }

    const response = NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
    const existingLocale = request.cookies.get(localeCookieName)?.value;

    if (existingLocale !== localeInPath) {
      response.cookies.set(localeCookieName, localeInPath, {
        path: "/",
        sameSite: "lax"
      });
    }

    applySecurityHeaders(response.headers, { nonce, request });
    response.headers.set("x-nonce", nonce);
    response.headers.set("x-nextjs-csp-nonce", nonce);
    response.headers.set("x-csp-nonce", nonce);
    return response;
  });
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"]
};
