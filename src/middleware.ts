import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = new Set(["/", "/auth/login", "/auth/signup", "/auth/callback", "/api/auth"]);
const PUBLIC_PREFIXES = ["/api/auth/", "/api/r2/"];

const ADMIN_PATHS = new Set(["/admin"]);

function isPublicPath(pathname: string) {
  const normalizedPath = pathname.replace(/\/$/, "") || "/";
  return PUBLIC_PATHS.has(normalizedPath) || PUBLIC_PREFIXES.some((prefix) => normalizedPath.startsWith(prefix));
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createMiddlewareClient({ req, res }, {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isPublic = isPublicPath(req.nextUrl.pathname);

  // 1. Require auth for all non-public routes
  if (!session && !isPublic) {
    const loginUrl = new URL("/auth/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirect logged-in users away from auth pages
  if (session && (req.nextUrl.pathname === "/auth/login" || req.nextUrl.pathname === "/auth/signup")) {
    return NextResponse.redirect(new URL("/projects", req.url));
  }

  // 3. Admin gate: only admin role may access /admin
  if (session && ADMIN_PATHS.has(req.nextUrl.pathname.replace(/\/$/, ""))) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.redirect(new URL("/projects", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif).*)",
  ],
};
