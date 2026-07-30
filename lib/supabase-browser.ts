"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser client. Sign-in and sign-out happen here so Supabase writes the
 * session cookies itself; the middleware then refreshes them on every request.
 */
export function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Sign-in isn't configured — NEXT_PUBLIC_SUPABASE_URL/ANON_KEY are missing.");
  }
  return createBrowserClient(url, key);
}
