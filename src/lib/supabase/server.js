/**
 * @file Supabase SSR Server Client
 * @module lib/supabase/server
 * @description Creates a Supabase client for server-side rendering (SSR).
 *              Uses cookie-based auth so the client respects the logged-in
 *              user's session and all Row-Level Security policies.
 *
 * @usage
 *   import { createClient } from "@/lib/supabase/server";
 *   const supabase = await createClient();
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Guard: during build/prerender, env vars may be placeholders.
  const safeUrl =
    url && url.startsWith("http") ? url : "https://placeholder.supabase.co";
  const safeKey =
    key && key.startsWith("eyJ")
      ? key
      : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

  return createServerClient(safeUrl, safeKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Enforce Strict Cookie Security (OWASP A05)
            const secureOptions = {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict'
            };
            cookieStore.set(name, value, secureOptions);
          });
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}
