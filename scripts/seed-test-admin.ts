#!/usr/bin/env ts-node
/**
 * Seed script: create a test admin user for QA / demo.
 *
 * Usage:
 *   npx ts-node scripts/seed-test-admin.ts
 *
 * Environment variables required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * The script is idempotent — if the user already exists it will update
 * the profile to ensure role = "admin" and log the credentials again.
 */

import { createClient } from "@supabase/supabase-js";

const EMAIL = process.env.TEST_ADMIN_EMAIL || "admin@myclipiq.test";
const PASSWORD = process.env.TEST_ADMIN_PASSWORD || "TestAdmin123!";
const FULL_NAME = process.env.TEST_ADMIN_FULL_NAME || "Test Admin";

function die(msg: string): never {
  console.error("[seed-test-admin] ERROR:", msg);
  process.exit(1);
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    die(
      "Missing Supabase credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
    );
  }

  const supabaseAdmin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Check if user already exists by email
  const { data: existingList, error: listErr } =
    await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

  if (listErr) {
    die(`Failed to list users: ${listErr.message}`);
  }

  const existing = existingList?.users?.find((u) => u.email === EMAIL);

  if (existing) {
    console.log(`[seed-test-admin] User already exists: ${EMAIL} (${existing.id})`);

    // Ensure profile role is admin
    const { error: upsertErr } = await supabaseAdmin
      .from("profiles")
      .upsert(
        { id: existing.id, email: EMAIL, full_name: FULL_NAME, role: "admin" },
        { onConflict: "id" }
      );

    if (upsertErr) {
      console.warn(
        `[seed-test-admin] Profile upsert warning: ${upsertErr.message}`
      );
    } else {
      console.log(`[seed-test-admin] Profile updated → role = admin`);
    }
  } else {
    // 2. Create user
    const { data: created, error: createErr } =
      await supabaseAdmin.auth.admin.createUser({
        email: EMAIL,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: FULL_NAME },
      });

    if (createErr || !created?.user) {
      die(`createUser failed: ${createErr?.message || "unknown error"}`);
    }

    const userId = created.user.id;
    console.log(`[seed-test-admin] Created user: ${EMAIL} (${userId})`);

    // 3. Upsert profile with admin role
    const { error: profileErr } = await supabaseAdmin
      .from("profiles")
      .upsert(
        { id: userId, email: EMAIL, full_name: FULL_NAME, role: "admin" },
        { onConflict: "id" }
      );

    if (profileErr) {
      console.warn(
        `[seed-test-admin] Profile upsert warning: ${profileErr.message}`
      );
    } else {
      console.log(`[seed-test-admin] Profile created → role = admin`);
    }
  }

  // 4. Print credentials (developer / local use only)
  console.log("");
  console.log("==============================================");
  console.log("  TEST ADMIN CREDENTIALS (DEV / QA ONLY)");
  console.log("==============================================");
  console.log(`  Email:    ${EMAIL}`);
  console.log(`  Password: ${PASSWORD}`);
  console.log("==============================================");
  console.log("");
  console.log("Login at: http://localhost:3000/auth/login");
  console.log("Admin at: http://localhost:3000/admin");
}

main().catch((err) => {
  die(String(err));
});
