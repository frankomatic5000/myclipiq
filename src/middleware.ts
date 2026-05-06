import createIntlMiddleware from 'next-intl/middleware';
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {routing} from './lib/i18n/routing';

const handleI18nRouting = createIntlMiddleware(routing);

const PUBLIC_PATHS = new Set([
  "/",
  "/projects",
  "/customers",
  "/team",
  "/legal",
  "/ai-analysis",
  "/auth/login",
  "/auth/signup",
  "/auth/callback",
  "/api/auth",
]);
const PUBLIC_PREFIXES = ["/api/auth/", "/api/r2/"];
const ADMIN_PATH = "/admin";

function stripLocale(pathname: string) {
  const segments = pathname.split("/");
  const maybeLocale = segments[1];

  if (routing.locales.includes(maybeLocale as (typeof routing.locales)[number])) {
    const withoutLocale = `/${segments.slice(2).join("/")}`;
    return withoutLocale.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
  }

  return pathname.replace(/\/$/, "") || "/";
}

function getLocale(pathname: string) {
  const maybeLocale = pathname.split("/")[1];
  return routing.locales.includes(maybeLocale as (typeof routing.locales)[number]) ? maybeLocale : routing.defaultLocale;
}

function localizedPath(pathname: string, locale: string) {
  return `/${locale}${pathname === "/" ? "" : pathname}`;
}

function isPublicPath(pathname: string) {
  const normalizedPath = stripLocale(pathname);
  return PUBLIC_PATHS.has(normalizedPath) || PUBLIC_PREFIXES.some((prefix) => normalizedPath.startsWith(prefix));
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const normalizedPath = stripLocale(pathname);
  const locale = getLocale(pathname);

  // Let next-intl add/detect the locale before auth decisions on unprefixed routes.
  const intlResponse = handleI18nRouting(req);
  if (intlResponse.headers.get("location") && !pathname.startsWith(`/${locale}`)) {
    return intlResponse;
  }

  const isPublic = isPublicPath(pathname);

  // Public marketing and auth routes should not touch Supabase auth at all.
  if (isPublic) {
    return intlResponse;
  }

  const supabase = createMiddlewareClient({ req, res: intlResponse }, {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 1. Require auth for all non-public locale routes.
  if (!session) {
    return NextResponse.redirect(new URL(localizedPath("/auth/login", locale), req.url));
  }

  // 2. Admin gate: only admin role may access /{locale}/admin.
  if (normalizedPath === ADMIN_PATH || normalizedPath.startsWith(`${ADMIN_PATH}/`)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.redirect(new URL(localizedPath("/projects", locale), req.url));
    }
  }

  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
