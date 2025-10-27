import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  defaultLocale,
  isLocale,
  localeCookieName
} from "./utils/i18n";

const PUBLIC_FILE = /\.(.*)$/;

function getLocaleFromPath(pathname: string) {
  const [, maybeLocale] = pathname.split("/");
  return maybeLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
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
    return response;
  }

  const response = NextResponse.next();
  const existingLocale = request.cookies.get(localeCookieName)?.value;

  if (existingLocale !== localeInPath) {
    response.cookies.set(localeCookieName, localeInPath, {
      path: "/",
      sameSite: "lax"
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"]
};
