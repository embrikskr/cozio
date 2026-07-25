import Stripe from "stripe";

// Stripe is optional in dev: if no key is set, billing degrades gracefully and
// the app stays fully usable (no charging). Set the keys in production.
const SECRET = process.env.STRIPE_SECRET_KEY;

export const stripe = SECRET ? new Stripe(SECRET) : null;

/** The graduated per-property Price created in your Stripe dashboard (see DEPLOY.md). */
export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID;

export function stripeReady(): boolean {
  return !!stripe && !!STRIPE_PRICE_ID;
}

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/** Whether the host may keep guides live: an active subscription, or a trial still running. */
export function billingActive(user: { billingStatus: string; trialEndsAt: Date | null }): boolean {
  if (user.billingStatus === "active") return true;
  return user.billingStatus === "trialing" && !!user.trialEndsAt && user.trialEndsAt.getTime() > Date.now();
}
