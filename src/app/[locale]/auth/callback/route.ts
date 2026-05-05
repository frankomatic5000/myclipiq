import { NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createServerComponentClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL("/projects", requestUrl.origin));
}
