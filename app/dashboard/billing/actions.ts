"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/guard";
import {
  stripe,
  stripeReady,
  STRIPE_PRICE_ID,
  APP_URL,
  MAX_PROPERTIES,
  propertyLimitReason,
  paidPropertyCount,
} from "@/lib/stripe";
import { monthlyTotal } from "@/lib/constants";
import { supabaseAdmin } from "@/lib/supabase";

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
 * of properties). Charged straight away — there is no trial to wait out.
 * Returns the URL to redirect to.
 */
export async function startCheckout(
  quantity: number,
): Promise<{ url?: string; error?: string }> {
  const userId = await requireUserId();
  if (!stripeReady() || !stripe || !STRIPE_PRICE_ID) {
    return { error: "Billing isn't configured yet." };
  }
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  // The host says how many properties they are buying. It used to be inferred
  // from how many they had already created, which meant someone with five
  // apartments had to subscribe for one and then add and pay four more times.
  const existing = await prisma.property.count({ where: { userId } });
  const count = Math.floor(Number(quantity));
  if (!Number.isFinite(count) || count < 1 || count > MAX_PROPERTIES) {
    return { error: `Choose between 1 and ${MAX_PROPERTIES} properties.` };
  }
  if (count < existing) {
    return { error: `You already have ${existing} properties — delete some first.` };
  }
  const customerId = await ensureCustomer(user);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: STRIPE_PRICE_ID, quantity: Math.max(1, count) }],
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
 * Change how many properties the plan covers.
 *
 * Invoiced immediately in both directions, so a host pays for what they add
 * when they add it and is credited when they give it back. The floor is how
 * many properties they actually have — dropping below that would leave guides
 * live that nobody is paying for, so they delete first, then reduce.
 */
export async function changePlanQuantity(
  quantity: number,
): Promise<{ ok: boolean; error?: string }> {
  const userId = await requireUserId();
  if (!stripeReady() || !stripe) return { ok: false, error: "Billing isn't configured yet." };

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { stripeSubscriptionId: true },
  });
  if (!user.stripeSubscriptionId) return { ok: false, error: "No subscription to change." };

  const next = Math.floor(Number(quantity));
  if (!Number.isFinite(next) || next < 1 || next > MAX_PROPERTIES) {
    return { ok: false, error: `Choose between 1 and ${MAX_PROPERTIES} properties.` };
  }

  const existing = await prisma.property.count({ where: { userId } });
  if (next < existing) {
    return {
      ok: false,
      error: `You have ${existing} properties. Delete ${existing - next} before going down to ${next}.`,
    };
  }

  try {
    const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    const item = sub.items.data[0];
    if (!item) return { ok: false, error: "Subscription has no line to update." };
    if (item.quantity === next) return { ok: true };

    await stripe.subscriptions.update(sub.id, {
      items: [{ id: item.id, quantity: next }],
      proration_behavior: "always_invoice",
    });
  } catch (e) {
    console.error("[billing] plan change failed for", userId, e);
    return { ok: false, error: "Couldn't update your plan — please try again." };
  }

  revalidatePath("/dashboard/billing");
  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * What the next property would cost, for the confirmation shown before it is
 * created. Returns monthly totals in whole currency units, using the same bands
 * the pricing page quotes.
 */
export async function propertyQuota(): Promise<{
  count: number;
  paid: number | null;
  isPaying: boolean;
  currentMonthly: number;
  nextMonthly: number;
  blockedReason: string | null;
}> {
  const userId = await requireUserId();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { billingStatus: true, stripeSubscriptionId: true },
  });
  const count = await prisma.property.count({ where: { userId } });
  const paid = await paidPropertyCount(user.stripeSubscriptionId);

  return {
    count,
    paid,
    isPaying: user.billingStatus === "active",
    currentMonthly: monthlyTotal(count),
    nextMonthly: monthlyTotal(count + 1),
    blockedReason: stripeReady() ? propertyLimitReason(user, count, paid) : null,
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

  // Identity first, profile second. A profile without an identity is a broken
  // login; an identity without a profile is a ghost that can still sign in.
  const admin = supabaseAdmin();
  if (admin) {
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) {
      console.error("[account] could not delete auth user", userId, error.message);
      return { ok: false, error: "We couldn't delete your account just now. Please try again." };
    }
  }

  await prisma.user.delete({ where: { id: userId } });
  return { ok: true };
}
