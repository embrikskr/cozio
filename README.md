# Hostly

Digital guidebooks for short-term rentals — a Touchstay-style platform. Hosts create
beautiful, branded guides (check-in, house manual, local tips) that guests open with a link
or QR code, no app required.

## Tech stack

- **Next.js 15** (App Router) + **React 19**
- **Prisma 6** — SQLite for local dev, switchable to Postgres/Supabase for production
- **NextAuth** (credentials + bcrypt)
- **Tailwind CSS 4** + Radix UI + lucide-react
- **Zod** validation, server actions for all mutations

## Getting started

```bash
npm install
npm run db:push      # create the SQLite schema
npm run db:seed      # load the demo property + account
npm run dev          # http://localhost:3000
```

**Demo login:** `demo@hostly.app` / `password123`
**Live guidebook example:** http://localhost:3000/g/sjoboden

Useful scripts: `npm run db:reset` (wipe + reseed), `npm run build`.

## What's built

**Host side (`/dashboard`)**
- Email/password auth (register, login, protected routes)
- Multiple properties, each with a starter guidebook auto-created
- Guidebook editor: sections + topics (markdown, icons, reorder, images)
- Local recommendations (categories, host favourites, map links, coordinates)
- Branding (welcome message, host profile, cover image, brand colour)
- Settings (location, key-info cards, Wi-Fi, access PIN, duplicate-as-template, delete)
- Share tab: guest link + QR code
- Analytics (14-day view chart) and a guest-message inbox
- Plan & billing with property limits (Free / Pro / Business)

**Guest side (`/g/[slug]`)**
- Branded mobile-first guidebook (cover, welcome, host card)
- Quick key-info cards (check-in, Wi-Fi with copy, directions, parking, emergency, call host)
- Collapsible sections & topics with rendered markdown
- Filterable recommendations with directions
- "Message your host" lead capture
- Optional PIN gate, anonymous view tracking, PWA manifest

## Going to production

1. **Database** — in `prisma/schema.prisma` change `provider = "sqlite"` to `"postgresql"`,
   set `DATABASE_URL` to your Supabase connection string, then `npx prisma db push`.
2. **Auth** — set a real `NEXTAUTH_SECRET` (`openssl rand -base64 32`) and `NEXTAUTH_URL`.
3. **Billing** — wire Stripe Checkout in `app/dashboard/billing/actions.ts` (currently switches
   plans directly for testing).
4. Deploy to Vercel.

## Project layout

```
app/
  (auth)/            login & register
  dashboard/         host app + server actions
  g/[slug]/          public guest guidebook
  api/               auth, register, track, leads, unlock
components/
  ui/                design-system primitives
  dashboard/         editor tabs & nav
  guest/             guest view, recommendations, lead form
lib/                 prisma, auth, validators, constants, markdown
prisma/              schema + seed
```
