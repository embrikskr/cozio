# Launch guide — Hostly

Everything to take Hostly from local SQLite to a live, paid product on Vercel +
Supabase + Stripe. Follow top to bottom; ~30–45 minutes.

---

## 0. Before you start — rotate the AI key

The Anthropic key in `.env` was shared in chat. In the [Anthropic Console](https://console.anthropic.com)
create a **new** key, delete the old one, and use the new key everywhere below.

---

## 1. Database — Supabase Postgres

1. Create a project at [supabase.com](https://supabase.com). Pick a region near your guests.
2. In **Project Settings → Database → Connection string**, copy the **Transaction pooler**
   URL (port `6543`, ends with `?pgbouncer=true`). You'll also see a **direct** URL (port `5432`)
   used for migrations.
3. In `prisma/schema.prisma`, change the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"   // was "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
4. Locally, point `DATABASE_URL` at the **direct** (5432) URL and create the schema:
   ```bash
   npx prisma db push      # or: npx prisma migrate dev --name init
   npm run db:seed         # optional: load the demo account
   ```
   (On Vercel you'll use the **pooled** 6543 URL — see step 3.)

> SQLite → Postgres is fully compatible here: the schema uses no SQLite-only features.

---

## 2. Stripe — per-property billing

Hostly bills per **published property** with volume discounts. Recreate the price
bands from `lib/constants.ts` as a single graduated Stripe Price.

1. In the [Stripe Dashboard](https://dashboard.stripe.com) → **Product catalogue → Add product**.
   - Name: `Hostly property`.
   - Pricing model: **Recurring**, **Usage is metered? No** (per-unit), **Graduated tiers**.
   - Tiers (monthly), matching `PRICING.bands`:

     | For the first… | Price per unit |
     | --- | --- |
     | 1 unit | $9 |
     | up to 5 | $7 |
     | up to 15 | $5 |
     | 16 and above | $4 |
   - Save and copy the **Price ID** (`price_...`) → `STRIPE_PRICE_ID`.
2. Copy your **Secret key** (`sk_live_...`) → `STRIPE_SECRET_KEY`.
3. **Webhook**: Developers → Webhooks → Add endpoint:
   - URL: `https://YOUR_DOMAIN/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.created`,
     `customer.subscription.updated`, `customer.subscription.deleted`.
   - Copy the **Signing secret** (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`.

> The app charges the host's subscription with `quantity = number of properties` and keeps
> it in sync automatically. To change prices later, edit the Stripe tiers (and `PRICING.bands`
> so the in-app calculator matches).

---

## 3. Deploy — Vercel

1. Push this repo to GitHub.
2. At [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
3. Add environment variables (Project → Settings → Environment Variables) — use
   `.env.example` as the checklist:

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | Supabase **pooled** URL (port 6543, `?pgbouncer=true`) |
   | `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | `https://YOUR_DOMAIN` |
   | `NEXT_PUBLIC_APP_URL` | `https://YOUR_DOMAIN` |
   | `NEXT_PUBLIC_APP_NAME` | `Hostly` |
   | `ANTHROPIC_API_KEY` | your new key |
   | `ANTHROPIC_MODEL` | `claude-haiku-4-5` |
   | `STRIPE_SECRET_KEY` / `STRIPE_PRICE_ID` / `STRIPE_WEBHOOK_SECRET` | from step 2 |

4. Deploy. The build runs `prisma generate && next build` automatically.
5. Add your **domain** under Project → Domains, then update `NEXTAUTH_URL` and
   `NEXT_PUBLIC_APP_URL` to match and redeploy.

---

## 4. Post-launch checklist

- [ ] Sign up a test host → confirm the 14-day trial banner on **Billing**.
- [ ] Add a payment method → confirm Stripe Checkout → webhook flips status to **active**.
- [ ] Add/remove a property → confirm the subscription quantity updates in Stripe.
- [ ] Open a guidebook → ask the AI concierge a question → confirm a real answer.
- [ ] Review `/privacy` and `/terms`, replace the placeholder contact emails, and have
      them reviewed by a professional.

## 5. Recommended hardening (soon after launch)

- **Rate limiting** (`lib/ratelimit.ts`) is in-memory — fine for one instance, but on Vercel's
  serverless functions it won't share counts. Swap for [Upstash Redis](https://upstash.com) for
  real protection on the public `/api/concierge` and other endpoints.
- **Email** — wire [Resend](https://resend.com) into `app/dashboard/messages/actions.ts` so
  Memo actually sends, and to notify hosts of new leads/orders.
- **Image uploads** — currently URL fields; add Supabase Storage for direct uploads.
- **Error monitoring** — add Sentry.
- **Backups** — enable Supabase point-in-time recovery.
