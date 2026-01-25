import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  defaultLocale,
  isLocale,
  localeCookieName
} from "./utils/i18n";
import { isThemeLocale, themeLocaleCookieName } from "./utils/theme";
import {
  registerEdgeInstrumentation,
  withEdgeSpan
} from "./lib/otel/edge";
import { applySecurityHeaders } from "./lib/security/headers";

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

    const requestHeaders = new Headers(request.headers);

    if (pathname.startsWith("/api")) {
      const apiResponse = NextResponse.next({
        request: {
          headers: requestHeaders
        }
      });
      applySecurityHeaders(apiResponse.headers, { request });
      return apiResponse;
    }

    const localeInPath = getLocaleFromPath(pathname);

    if (!isLocale(localeInPath)) {
      const redirectUrl = request.nextUrl.clone();
      const pathnameSuffix = pathname === "/" ? "" : pathname;
      redirectUrl.pathname = `/${defaultLocale}${pathnameSuffix}`;

      const response = NextResponse.redirect(redirectUrl);
      const existingThemeLocale = request.cookies.get(themeLocaleCookieName)?.value;
      response.cookies.set(localeCookieName, defaultLocale, {
        path: "/",
        sameSite: "lax"
      });
      if (existingThemeLocale !== "dreamland") {
        response.cookies.set(themeLocaleCookieName, defaultLocale, {
          path: "/",
          sameSite: "lax",
          maxAge: 31536000
        });
      }
      applySecurityHeaders(response.headers, { request });
      return response;
    }

    const existingLocale = request.cookies.get(localeCookieName)?.value;
    const existingThemeLocale = request.cookies.get(themeLocaleCookieName)?.value;
    const themeLocaleValid = isThemeLocale(existingThemeLocale);
    const shouldSyncThemeLocale =
      existingThemeLocale !== "dreamland" &&
      (!isLocale(existingLocale) ||
        !themeLocaleValid ||
        (existingLocale !== localeInPath && existingThemeLocale === existingLocale));

    requestHeaders.set("x-portfolio-locale", localeInPath);
    const response = NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });

    if (existingLocale !== localeInPath) {
      response.cookies.set(localeCookieName, localeInPath, {
        path: "/",
        sameSite: "lax"
      });
    }

    if (shouldSyncThemeLocale) {
      response.cookies.set(themeLocaleCookieName, localeInPath, {
        path: "/",
        sameSite: "lax",
        maxAge: 31536000
      });
    }

    applySecurityHeaders(response.headers, { request });
    return response;
  });
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"]
};
