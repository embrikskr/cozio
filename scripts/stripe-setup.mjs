// One-off: create the Hostly per-property graduated Price in Stripe.
//
//   node --env-file=.env scripts/stripe-setup.mjs
//
// Reads STRIPE_SECRET_KEY from .env, creates the "Hostly property" product
// with a graduated monthly price that matches PRICING.bands in
// lib/constants.ts ($9 / $7 / $5 / $4, USD), then prints the price id to put
// into STRIPE_PRICE_ID. Safe to re-run (creates a fresh product+price each time).
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("✗ STRIPE_SECRET_KEY is missing in .env");
  process.exit(1);
}

const stripe = new Stripe(key);
const live = key.startsWith("sk_live_");

const price = await stripe.prices.create({
  currency: "usd",
  recurring: { interval: "month" },
  billing_scheme: "tiered",
  tiers_mode: "graduated",
  tiers: [
    { up_to: 1, unit_amount: 900 }, // 1st property — $9
    { up_to: 5, unit_amount: 700 }, // properties 2–5 — $7
    { up_to: 15, unit_amount: 500 }, // properties 6–15 — $5
    { up_to: "inf", unit_amount: 400 }, // 16+ — $4
  ],
  product_data: { name: "Hostly property" },
});

console.log(`\n✓ Created in ${live ? "LIVE" : "TEST"} mode`);
console.log(`  product: ${price.product}`);
console.log(`  STRIPE_PRICE_ID=${price.id}\n`);
