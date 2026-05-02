import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";

// Lazy singleton — only created when called from a client component.
// NEVER instantiate at module level to avoid build-time errors.
let _client: ReturnType<typeof createBrowserSupabaseClient> | null = null;

export function getSupabaseBrowser() {
  if (typeof window === "undefined") {
    // SSR context — return a no-op stub so server components don't crash
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
        signUp: async () => ({ data: { user: null, session: null }, error: null }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
          }),
        }),
      }),
    } as unknown as ReturnType<typeof createBrowserSupabaseClient>;
  }

  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      console.warn("[MyClipIQ] Supabase env vars not set — auth features disabled");
      return {
        auth: {
          getSession: async () => ({ data: { session: null }, error: null }),
          getUser: async () => ({ data: { user: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: "unconfigured" } }),
          signUp: async () => ({ data: { user: null, session: null }, error: { message: "unconfigured" } }),
          signOut: async () => ({ error: null }),
        },
        from: () => ({
          select: () => ({
            eq: () => ({
              single: async () => ({ data: null, error: null }),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof createBrowserSupabaseClient>;
    }
    _client = createBrowserSupabaseClient({ supabaseUrl: url, supabaseKey: key });
  }
  return _client;
}