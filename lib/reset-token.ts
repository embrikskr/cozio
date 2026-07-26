import { createHmac, timingSafeEqual } from "crypto";

// Password reset links, signed rather than stored.
//
// The signature covers the user's current password hash, so the moment a
// password changes every outstanding link for that account stops verifying.
// That gives single use for free — no table to migrate, no rows to expire, and
// no way for an old link in an inbox to work twice.

const TTL_MS = 60 * 60 * 1000; // one hour

function secret(): string {
  const s = process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("NEXTAUTH_SECRET is required to sign password resets");
  return s;
}

function sign(userId: string, passwordHash: string, expiresAt: number): string {
  return createHmac("sha256", secret())
    .update(`${userId}.${passwordHash}.${expiresAt}`)
    .digest("base64url");
}

/** A token to put in a reset link. Valid for one hour, or until the password changes. */
export function createResetToken(userId: string, passwordHash: string): string {
  const expiresAt = Date.now() + TTL_MS;
  return `${userId}.${expiresAt}.${sign(userId, passwordHash, expiresAt)}`;
}

export type ResetTokenCheck = { userId: string } | { error: "invalid" | "expired" };

/**
 * Verify a token against the account's *current* password hash. Returns the
 * user id to reset, or why it failed. The caller looks the user up — this
 * function does no I/O so it stays easy to reason about.
 */
export function parseResetToken(token: string): { userId: string; expiresAt: number } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, exp] = parts;
  const expiresAt = Number(exp);
  if (!userId || !Number.isFinite(expiresAt)) return null;
  return { userId, expiresAt };
}

export function verifyResetToken(token: string, passwordHash: string): ResetTokenCheck {
  const parsed = parseResetToken(token);
  if (!parsed) return { error: "invalid" };

  const [userId, exp, provided] = token.split(".");
  const expected = sign(userId, passwordHash, Number(exp));

  // Constant-time: a length mismatch alone would otherwise leak through timing.
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { error: "invalid" };

  // Expiry is checked after the signature so an attacker cannot use the
  // difference between "expired" and "invalid" to probe for valid tokens.
  if (Date.now() > parsed.expiresAt) return { error: "expired" };

  return { userId };
}
