"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/guard";
import {
  stripe,
  stripeReady,
  STRIPE_PRICE_ID,
  APP_URL,
  TRIAL_PROPERTY_LIMIT,
  propertyLimitReason,
} from "@/lib/stripe";
import { monthlyTotal } from "@/lib/constants";

/** Per-property billing summary for the signed-in host. */
export async function billingSummary() {
  const userId = await requireUserId();
  const count = await prisma.property.count({ where: { userId } });
  return { properties: count };
}

/** Create or reuse the host's Stripe customer. */
async function ensureCustomer(user: {
  id: string;
  email: string;
  name: string | null;
  stripeCustomerId: string | null;
}): Promise<string> {
  if (!stripe) throw new Error("Stripe not configured");
  if (user.stripeCustomerId) return user.stripeCustomerId;
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name ?? undefined,
    metadata: { userId: user.id },
  });
  await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customer.id } });
  return customer.id;
}

/**
 * Start a Stripe Checkout subscription, billed per property (quantity = number
 * of properties). Honours any remaining free trial. Returns the URL to redirect to.
 */
export async function startCheckout(): Promise<{ url?: string; error?: string }> {
  const userId = await requireUserId();
  if (!stripeReady() || !stripe || !STRIPE_PRICE_ID) {
    return { error: "Billing isn't configured yet." };
  }
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  // Every property, published or not. A property is a slot you have paid for;
  // you buy it, then you fill it. Billing only live guides would let a host
  // hold ten drafts for free and flip them live at will.
  const count = await prisma.property.count({ where: { userId } });
  const customerId = await ensureCustomer(user);

  // Don't charge until the in-app trial ends.
  const trialDaysLeft = user.trialEndsAt
    ? Math.ceil((user.trialEndsAt.getTime() - Date.now()) / 86_400_000)
    : 0;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: STRIPE_PRICE_ID, quantity: Math.max(1, count) }],
    subscription_data: trialDaysLeft > 0 ? { trial_period_days: trialDaysLeft } : undefined,
    allow_promotion_codes: true,
    success_url: `${APP_URL}/dashboard/billing?success=1`,
    cancel_url: `${APP_URL}/dashboard/billing`,
  });
  return { url: session.url ?? undefined };
}

/** Open the Stripe billing portal so the host can manage payment / cancel. */
export async function openBillingPortal(): Promise<{ url?: string; error?: string }> {
  const userId = await requireUserId();
  if (!stripe) return { error: "Billing isn't configured yet." };
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.stripeCustomerId) return { error: "No billing account yet." };
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${APP_URL}/dashboard/billing`,
  });
  return { url: session.url };
}

/**
 * Keep the subscription quantity in sync with the property count. Called after
 * a property is created or deleted.
 *
 * Prorated, deliberately. This ran with `proration_behavior: "none"`, which
 * meant a property added the day after an invoice was free until the next one —
 * add five that day and you had five free properties for a month. With
 * `create_prorations` the part-month is metered onto the next invoice, and
 * removing a property produces a credit the same way. Nobody is charged at the
 * moment they click; the adjustment simply lands where it belongs.
 *
 * Best-effort — never throws into the caller. A failure here under-bills rather
 * than blocking a host mid-task, and the next create or delete reconciles it.
 */
export async function syncBillingQuantity(userId: string): Promise<void> {
  if (!stripeReady() || !stripe) return;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeSubscriptionId: true },
    });
    if (!user?.stripeSubscriptionId) return;
    const count = await prisma.property.count({ where: { userId } });
    const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    const item = sub.items.data[0];
    if (!item) return;

    const quantity = Math.max(1, count);
    if (item.quantity === quantity) return; // nothing to do, and no stray proration

    await stripe.subscriptions.update(sub.id, {
      items: [{ id: item.id, quantity }],
      // Invoiced there and then, not at the end of the period. A property is
      // paid for before it is used; a host who removes one gets the credit the
      // same way. "create_prorations" would have deferred both to the next bill.
      proration_behavior: "always_invoice",
    });
  } catch (e) {
    // Logged rather than swallowed: silent under-billing is the kind of bug
    // that only shows up as missing revenue months later.
    console.error("[billing] quantity sync failed for", userId, e);
  }
}

/**
 * What the next property would cost, for the confirmation shown before it is
 * created. Returns monthly totals in whole currency units, using the same bands
 * the pricing page quotes.
 */
export async function propertyQuota(): Promise<{
  count: number;
  isPaying: boolean;
  trialLimit: number;
  currentMonthly: number;
  nextMonthly: number;
  blockedReason: string | null;
}> {
  const userId = await requireUserId();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { billingStatus: true, trialEndsAt: true },
  });
  const count = await prisma.property.count({ where: { userId } });

  return {
    count,
    isPaying: user.billingStatus === "active",
    trialLimit: TRIAL_PROPERTY_LIMIT,
    currentMonthly: monthlyTotal(count),
    nextMonthly: monthlyTotal(count + 1),
    blockedReason: stripeReady() ? propertyLimitReason(user, count) : null,
  };
}

/**
 * Delete the account and everything under it.
 *
 * The privacy policy offers erasure on request, which is lawful but means every
 * request is manual work — and until now the address it pointed at did not
 * receive mail, so requests went nowhere. A host can now do it themselves.
 *
 * The subscription is cancelled first. Deleting the row while Stripe still has
 * an active subscription would keep charging a card belonging to an account
 * that no longer exists, which is the worst possible order to do this in.
 *
 * Properties, guidebooks, guest leads, orders and reviews all cascade from the
 * user row (see prisma/schema.prisma), so one delete removes the lot.
 */
export async function deleteAccount(confirmEmail: string): Promise<{ ok: boolean; error?: string }> {
  const userId = await requireUserId();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { email: true, stripeSubscriptionId: true, stripeCustomerId: true },
  });

  // Typing the address is the confirmation. A "are you sure?" dialog is too
  // easy to click through for something with no undo.
  if (confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
    return { ok: false, error: "That doesn't match the email on this account." };
  }

  if (stripe && user.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.cancel(user.stripeSubscriptionId);
    } catch (e) {
      // Refuse rather than delete: an orphaned live subscription bills a card
      // for an account nobody can log into to stop it.
      console.error("[account] could not cancel subscription for", userId, e);
      return {
        ok: false,
        error: "We couldn't cancel your subscription just now. Please try again, or email us.",
      };
    }
  }

  await prisma.user.delete({ where: { id: userId } });
  return { ok: true };
}
