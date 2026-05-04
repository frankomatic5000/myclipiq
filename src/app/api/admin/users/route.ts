import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Supabase service-role client (admin actions only, never exposed to client)
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// POST /api/admin/users
// Protected by admin middleware via RLS + explicit role check
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  // 1. Verify current session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Verify caller is admin
  const { data: callerProfile, error: callerErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (callerErr || callerProfile?.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden: admin only" },
      { status: 403 }
    );
  }

  // 3. Parse payload
  const body = await request.json().catch(() => ({}));
  const {
    email = `test-${Date.now()}@myclipiq.ai`,
    password = `Test-${Math.random().toString(36).slice(2, 8)}!`,
    fullName = "Test User",
    role = "viewer",
  } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Missing email or password" },
      { status: 400 }
    );
  }

  // 4. Create user via admin API (no email confirmation)
  const supabaseAdmin = getSupabaseAdmin();
  const { data: createdUser, error: createErr } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,           // skip confirmation
      user_metadata: { full_name: fullName },
    });

  if (createErr || !createdUser?.user) {
    console.error("[Admin API] createUser failed:", createErr?.message);
    return NextResponse.json(
      { error: createErr?.message || "Failed to create user" },
      { status: 500 }
    );
  }

  const userId = createdUser.user.id;

  // 5. Set role in profiles (upsert to guarantee row exists)
  const { error: profileErr } = await supabaseAdmin
    .from("profiles")
    .upsert({ id: userId, email, full_name: fullName, role }, { onConflict: "id" });

  if (profileErr) {
    console.error("[Admin API] profile upsert failed:", profileErr.message);
    // Best-effort: still return 201; user was created
  }

  return NextResponse.json(
    {
      id: userId,
      email,
      full_name: fullName,
      role,
      created_at: createdUser.user.created_at,
    },
    { status: 201 }
  );
}
