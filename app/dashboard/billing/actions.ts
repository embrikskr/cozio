"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/guard";
import { stripe, stripeReady, STRIPE_PRICE_ID, APP_URL } from "@/lib/stripe";

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
 * a property is created or deleted. Best-effort — never throws into the caller.
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
    await stripe.subscriptions.update(sub.id, {
      items: [{ id: item.id, quantity: Math.max(1, count) }],
      proration_behavior: "none",
    });
  } catch {
    /* billing sync is best-effort; the webhook reconciles on the next event */
  }
}
