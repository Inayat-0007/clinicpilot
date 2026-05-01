/**
 * @file Supabase Browser Client
 * @module lib/supabase/client
 * @description Creates a Supabase client for browser-side (Client Components).
 *              This client respects Row-Level Security (RLS) — it uses the
 *              anon key and passes the user's auth cookie automatically.
 *
 * @usage
 *   import { createClient } from "@/lib/supabase/client";
 *   const supabase = createClient();
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Guard: during build/prerender, env vars may be placeholders.
  // Return a safe no-op client so static generation doesn't crash.
  if (!url || !url.startsWith("http")) {
    return createBrowserClient(
      "https://placeholder.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder"
    );
  }

  return createBrowserClient(url, key);
}
