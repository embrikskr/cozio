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

/** How many properties the free trial covers. Beyond this, a card is required. */
export const TRIAL_PROPERTY_LIMIT = 1;

export type BillingUser = { billingStatus: string; trialEndsAt: Date | null };

/**
 * How many properties this host may have right now.
 *
 * Paying hosts have no ceiling — every property is billed, so more properties
 * is more revenue, not something to ration. The trial is the opposite: it is
 * there to show what one guidebook feels like, not to run a portfolio for free.
 * Once the trial lapses without a subscription the answer is zero, which stops
 * new properties while leaving the existing ones editable.
 */
export function propertyAllowance(user: BillingUser): number {
  if (user.billingStatus === "active") return Number.POSITIVE_INFINITY;
  if (billingActive(user)) return TRIAL_PROPERTY_LIMIT;
  return 0;
}

/** Why a host can't add another property, or null when they can. */
export function propertyLimitReason(user: BillingUser, currentCount: number): string | null {
  const allowance = propertyAllowance(user);
  if (currentCount < allowance) return null;
  if (allowance === 0) {
    return "Your trial has ended — add a payment method to create more properties.";
  }
  return `Your free trial covers ${TRIAL_PROPERTY_LIMIT} property. Add a payment method to create more.`;
}
