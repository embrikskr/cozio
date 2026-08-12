import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Supabase Auth holds the identity — email, password hash, sessions, and later
// Google and Apple sign-in. Our own `User` table is a profile keyed to the same
// id, carrying the things Supabase has no opinion about: Stripe customer,
// billing status, and the properties a host owns.
//
// Passwords are no longer ours to store. That is the point: verification,
// resets, MFA and social providers come from Supabase rather than from code we
// have to keep correct ourselves.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function authReady(): boolean {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY;
}

/**
 * Server-side client bound to the request's cookies, so the session survives
 * across server components, route handlers and server actions.
 */
export async function supabaseServer() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required");
  }
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        // Server components cannot set cookies. The middleware refreshes the
        // session on every request, so swallowing this is safe rather than
        // load-bearing.
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {}
      },
    },
  });
}

/**
 * Admin client, service role. Never reaches the browser. Used only where the
 * app must act on an account without that account's session — deleting a user,
 * for instance.
 */
export function supabaseAdmin() {
  if (!SUPABASE_URL || !SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
