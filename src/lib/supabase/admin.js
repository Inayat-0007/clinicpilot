/**
 * @file Supabase Admin Client
 * @module lib/supabase/admin
 * @description Creates a Supabase client that uses the SERVICE_ROLE key
 *              to bypass Row-Level Security. Use ONLY in trusted server
 *              contexts: webhooks, Edge Functions, cron jobs.
 *
 *              ⚠️  NEVER import this in a Client Component or expose
 *              the service role key to the browser.
 *
 * @usage
 *   import { createAdminClient } from "@/lib/supabase/admin";
 *   const supabase = createAdminClient();
 */

import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Guard: during build, env vars may be placeholders.
  const safeUrl =
    url && url.startsWith("http") ? url : "https://placeholder.supabase.co";
  const safeKey =
    serviceKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

  return createClient(safeUrl, safeKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
