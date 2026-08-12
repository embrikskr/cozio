import Stripe from "stripe";
import { MAX_PROPERTIES, PRICING } from "./constants";

export { MAX_PROPERTIES };

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

/**
 * Whether the host may keep guides live. There is no free tier and no trial:
 * a live guidebook means a paid subscription behind it.
 */
export function billingActive(user: { billingStatus: string }): boolean {
  return user.billingStatus === "active";
}

/**
 * How many properties this host is paying for — the quantity on their Stripe
 * subscription, which is the only place that number is authoritative.
 *
 * Returns null when there is no subscription to read.
 *
 * `trialing` counts here as well. We never ask Stripe for a trial, so a
 * subscription in that state can only come from a coupon or a comp granted by
 * hand in the Stripe dashboard — a deliberate decision that should work.
 */
export async function paidPropertyCount(subscriptionId: string | null): Promise<number | null> {
  if (!stripe || !subscriptionId) return null;
  try {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    if (sub.status !== "active" && sub.status !== "trialing") return null;
    return sub.items.data[0]?.quantity ?? null;
  } catch (e) {
    console.error("[billing] could not read subscription quantity:", e);
    return null;
  }
}

export type BillingUser = { billingStatus: string };

/**
 * How many properties this host may have right now: exactly what they bought.
 *
 * Nothing is free. A new account can look around, but the first guidebook needs
 * a plan behind it — so the answer for anyone without an active subscription is
 * zero, not one.
 */
export function propertyAllowance(user: BillingUser, paidCount: number | null): number {
  return billingActive(user) ? (paidCount ?? 0) : 0;
}

/** Why a host can't add another property, or null when they can. */
export function propertyLimitReason(
  user: BillingUser,
  currentCount: number,
  paidCount: number | null,
): string | null {
  const allowance = propertyAllowance(user, paidCount);
  if (currentCount < allowance) return null;
  if (billingActive(user)) {
    return `Your plan covers ${allowance} ${allowance === 1 ? "property" : "properties"}. Increase it to add another.`;
  }
  if (currentCount > 0) {
    return "Your subscription isn't active — restart it to add properties.";
  }
  return `Choose a plan to create your first guidebook — from $${PRICING.bands[0].price}/month.`;
}
