import { supabaseServer } from "./supabase";

// Identity lives in Supabase Auth: email, password, sessions, and later Google
// and Apple sign-in. Our `User` table is a profile keyed to the same id, holding
// what Supabase has no opinion about — Stripe customer, billing status, and the
// properties a host owns.
//
// This replaced NextAuth with a credentials provider and a bcrypt hash in our
// own column. Passwords are no longer ours to store, which is the point:
// verification, resets, MFA and social providers stop being code we have to
// keep correct.
//
// These two helpers are the only place the rest of the app asks "who is this?",
// so swapping the provider underneath touched one file rather than fifteen.

/** The signed-in host's id, or null. Matches the primary key in `User`. */
export async function currentUserId(): Promise<string | null> {
  try {
    const supabase = await supabaseServer();
    // getUser() verifies the token with Supabase. getSession() would trust
    // whatever sits in the cookie, and a forged cookie must not be enough to
    // read someone else's guidebooks.
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return data.user.id;
  } catch {
    // Misconfiguration or a stale cookie must read as signed-out, never crash.
    return null;
  }
}

/** The signed-in host's email — for display, and for confirming deletion. */
export async function currentUserEmail(): Promise<string | null> {
  try {
    const supabase = await supabaseServer();
    const { data } = await supabase.auth.getUser();
    return data.user?.email ?? null;
  } catch {
    return null;
  }
}
