import Stripe from "stripe";
import { MAX_PROPERTIES } from "./constants";

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

/** Whether the host may keep guides live: an active subscription, or a trial still running. */
export function billingActive(user: { billingStatus: string; trialEndsAt: Date | null }): boolean {
  if (user.billingStatus === "active") return true;
  return user.billingStatus === "trialing" && !!user.trialEndsAt && user.trialEndsAt.getTime() > Date.now();
}

/** How many properties the free trial covers. Beyond this, a card is required. */
export const TRIAL_PROPERTY_LIMIT = 1;

/**
 * How many properties this host is paying for — the quantity on their Stripe
 * subscription, which is the only place that number is authoritative.
 *
 * Returns null when there is no subscription to read.
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

export type BillingUser = { billingStatus: string; trialEndsAt: Date | null };

/**
 * How many properties this host may have right now.
 *
 * A paying host may have exactly what they bought. Properties used to be
 * uncapped for subscribers, with the subscription quantity trailing whatever
 * they had created — which meant nobody ever chose a number, they just created
 * and got billed. Now the number is the thing you buy, and properties fill it.
 *
 * The trial covers one. Once it lapses without a subscription the answer is
 * zero: no new properties, existing ones still editable.
 */
export function propertyAllowance(user: BillingUser, paidCount: number | null): number {
  if (user.billingStatus === "active") return paidCount ?? 0;
  if (billingActive(user)) return TRIAL_PROPERTY_LIMIT;
  return 0;
}

/** Why a host can't add another property, or null when they can. */
export function propertyLimitReason(
  user: BillingUser,
  currentCount: number,
  paidCount: number | null,
): string | null {
  const allowance = propertyAllowance(user, paidCount);
  if (currentCount < allowance) return null;
  if (user.billingStatus === "active") {
    return `Your plan covers ${allowance} ${allowance === 1 ? "property" : "properties"}. Increase it to add another.`;
  }
  if (allowance === 0) {
    return "Your trial has ended — add a payment method to create more properties.";
  }
  return `Your free trial covers ${TRIAL_PROPERTY_LIMIT} property. Add a payment method to create more.`;
}
