import Link from "next/link";
import {
  ArrowRight,
  Wifi,
  Key,
  MapPin,
  Sparkles,
  Plus,
  Send,
  BookOpen,
  BarChart3,
  Home,
  MessageSquare,
  Plug,
  CreditCard,
  Calendar,
  Shield,
  ChevronDown,
  Signal,
  BatteryFull,
} from "lucide-react";
import { Reveal } from "@/components/reveal";
import IPhoneMockup from "@/components/ui/iphone-mockup";
import { PricingCalculator } from "@/components/pricing-calculator";
import { APP_NAME } from "@/lib/constants";
import { CozioMark } from "@/components/cozio-mark";

/* ------------------------------------------------------------------ data --- */

const IMG = {
  hero: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=2000&q=80",
  heroPhone: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=700&q=80",
  caseStudy: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=2000&q=80",
  cta: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=2000&q=80",
};

// The "Plays nicely with your stack" logo marquee used to live here. It showed
// Airbnb, Booking.com, Guesty and friends, which implies integrations we do not
// have — nothing in the codebase talks to any of them. Showing third-party marks
// next to that claim is a promise we can't keep, so the band is gone until the
// integrations are real.

const guestTexts = [
  { text: "Hey!! What's the wifi password? 🙏", time: "11:42 PM" },
  { text: "How do we turn on the hot tub?", time: "6:15 AM" },
  { text: "What was the door code again??", time: "9:03 PM" },
];

const features = [
  ["AI guidebook generator", "Describe your place — or import your listing — and a full draft appears: sections, topics, local tips. You edit, it publishes."],
  ["AI concierge", "A chat tab that answers guests 24/7 using only your guidebook. It never invents an answer; it refers to you when unsure."],
  ["Upsells & orders", "Coming soon — sell early check-ins, transfers and welcome baskets. Guests request in a tap, you confirm from one inbox."],
  ["Live map & local picks", "Pin your favourite spots. Guests get an interactive map, distances and directions."],
  ["Insights", "See views per tab and which topics guests actually open, so you sharpen what matters."],
  ["Multi-language", "Add languages per property. Guests switch with one tap inside the guide."],
  ["Review funnel", "Happy guests get sent to your Google listing. Unhappy ones reach you privately — before the review goes public."],
  ["Wi-Fi QR & weather", "Scan-to-connect Wi-Fi codes and a live local forecast, built into every guide."],
] as const;

const steps = [
  {
    title: "Describe your place",
    body: `Tell ${APP_NAME} about your rental in a sentence or two. The AI drafts a complete guide — check-in, Wi-Fi, house manual and local tips — ready for you to edit.`,
  },
  {
    title: "Make it yours",
    body: "Adjust the wording, add your own photos, set your colours and choose which widgets to show. Everything updates live as you go.",
  },
  {
    title: "Share one link",
    body: "Publish and send guests a single link or QR code — nothing to install. Update it any time and guests always see the latest version.",
  },
];

const faqs = [
  { q: "Do my guests need to download an app?", a: "Never. The guide opens in any browser on any phone. Guests can pin it to their home screen for one-tap access." },
  { q: "How fast can I get set up?", a: "Most hosts publish their first guide in under ten minutes. Describe your place and the AI drafts the whole thing for you to edit." },
  { q: "Does the AI concierge really answer guests?", a: "Yes — 24/7, using only what's in your guidebook. If it doesn't know, it tells guests to message you instead of guessing." },
  { q: "Can I actually earn money with it?", a: "Hosts sell early check-ins, airport transfers, welcome baskets and tours straight from the guide. You confirm requests with a tap." },
  { q: "What about international guests?", a: "Add languages per property and guests switch with one tap in the guide." },
  { q: "What happens after the free trial?", a: `Pick a plan and pay per property — $9 for the first, less as you scale. No card needed to start, cancel anytime.` },
];

/* ------------------------------------------------------------------ mark --- */

function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5">
      <span className={`grid size-7 place-items-center ${light ? "bg-paper text-night" : "bg-forest text-paper"}`}>
        <CozioMark className="size-3.5" />
      </span>
      <span className={`font-display text-xl font-semibold tracking-tight ${light ? "text-paper" : "text-night"}`}>
        {APP_NAME}
      </span>
    </Link>
  );
}

function Kicker({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div className={`flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.25em] ${light ? "text-paper/60" : "text-muted"}`}>
      <span className={`h-px w-9 ${light ? "bg-paper/40" : "bg-night/30"}`} />
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ page --- */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper text-night">
      {/* ============================== HERO ============================== */}
      <section className="relative isolate overflow-hidden bg-night">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG.hero} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-night/90 via-night/65 to-night/25" />

        <header>
          <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5">
            <Wordmark light />
            <nav className="hidden items-center gap-9 text-sm text-paper/75 lg:flex">
              <Link href="#features" className="transition-colors hover:text-paper">Features</Link>
              <Link href="/g/brygga" className="transition-colors hover:text-paper">Live demo</Link>
              <Link href="/pricing" className="transition-colors hover:text-paper">Pricing</Link>
              <Link href="#faq" className="transition-colors hover:text-paper">FAQ</Link>
            </nav>
            <div className="flex items-center gap-6">
              <Link href="/login" className="hidden text-sm text-paper/75 hover:text-paper sm:block">Log in</Link>
              <Link href="/register" className="bg-paper px-5 py-2.5 text-sm font-semibold text-night transition-colors hover:bg-white">
                Start free
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-6xl items-end gap-16 px-5 pb-0 pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:pt-24">
          <div className="animate-fade-up pb-20 lg:pb-28">
            {/* Names the audience, not a partnership. We say who this is for —
                Airbnb and short-term rental hosts — which is plain description.
                We do not claim to integrate with those platforms, because we
                don't; that's why the logo marquee was removed. */}
            <Kicker light>For Airbnb &amp; short-term rental hosts</Kicker>

            {/* The headline has to say what the product IS. "Five-star stays,
                without the midnight texts" sold the outcome beautifully but only
                landed if you already knew what a digital guidebook was — a cold
                visitor couldn't tell what they were looking at. The outcome line
                still does its work, one step down. */}
            <h1 className="mt-7 font-display text-5xl font-semibold leading-[1.02] tracking-tight text-paper sm:text-6xl lg:text-[4.4rem]">
              Your rental, <em className="italic">explained</em> in one link.
            </h1>

            <p className="mt-7 max-w-md text-lg leading-relaxed text-paper/75">
              Check-in, Wi-Fi, house rules and local tips — so the midnight texts stop.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-7">
              <Link href="/register" className="inline-flex items-center gap-2.5 bg-paper px-8 py-4 text-sm font-semibold text-night transition-colors hover:bg-white">
                Create your guide — free <ArrowRight className="size-4" />
              </Link>
              <Link href="/g/brygga" className="text-sm font-medium text-paper underline decoration-paper/40 underline-offset-8 transition-colors hover:decoration-paper">
                See a live guide
              </Link>
            </div>
            <p className="mt-5 text-[13px] text-paper/50">14-day Pro trial · No credit card · Cancel anytime</p>

            {/* Inline stats — no boxes */}
            <div className="mt-14 flex max-w-lg items-start gap-10 border-t border-paper/20 pt-7">
              {[
                ["10 min", "to build with AI"],
                ["24/7", "AI guest concierge"],
                ["1 link", "everything guests need"],
              ].map(([a, b]) => (
                <div key={b}>
                  <div className="font-display text-2xl font-semibold text-paper sm:text-3xl">{a}</div>
                  <div className="mt-1 text-xs text-paper/55">{b}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Phone — anchored to the bottom edge */}
          <div className="relative hidden justify-center lg:flex">
            <div className="-mb-24">
              <GuidePhone scale={0.62} />
            </div>
          </div>
        </div>
      </section>

      {/* ============================ PROBLEM ============================ */}
      <section className="mx-auto max-w-6xl px-5 py-28">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <Reveal>
            <div className="relative mx-auto max-w-sm space-y-4">
              {guestTexts.map((m, i) => (
                <div key={m.text} className="rounded-2xl rounded-bl-sm bg-paper-2 px-5 py-3.5" style={{ marginLeft: i % 2 ? 32 : 0 }}>
                  <p className="text-[15px]">{m.text}</p>
                  <p className="mt-1 text-[11px] text-muted">{m.time}</p>
                </div>
              ))}
              <p className="pt-2 text-center font-display text-lg italic text-muted">Sound familiar?</p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <Kicker>The problem</Kicker>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Your inbox isn&apos;t a guidebook.
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
              Every question a guest sends is a gap in your welcome info — and an interruption in
              your day. {APP_NAME} closes those gaps with one link.
            </p>
            <div className="mt-9 max-w-md divide-y divide-line border-y border-line">
              {[
                ["Answers on tap, 24/7", "Wi-Fi, door codes, parking, house rules — one tap away."],
                ["In their language", "Guests switch language inside the guide."],
                ["Updated everywhere, instantly", "Change the door code once. Every guest sees it."],
              ].map(([title, sub]) => (
                <div key={title} className="py-4">
                  <div className="font-semibold">{title}</div>
                  <div className="mt-0.5 text-sm text-muted">{sub}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* =========================== SHOWCASE ============================ */}
      <section className="border-y border-line py-28">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <Kicker>The product</Kicker>
              <h2 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                You edit once.<br />They tap everywhere.
              </h2>
            </div>
            <p className="max-w-sm pb-2 text-muted">
              A calm dashboard for you, a beautiful guide for them — always in sync, with live preview.
            </p>
          </Reveal>

          <Reveal delay={150} className="relative mt-14">
            <BrowserMock />
            <div className="absolute -bottom-12 right-2 hidden md:block lg:right-10">
              <GuidePhone scale={0.45} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========================== CONCIERGE ============================ */}
      <section className="bg-night text-paper">
        <div className="mx-auto grid max-w-6xl items-center gap-16 px-5 py-28 lg:grid-cols-2">
          <Reveal>
            <Kicker light>AI concierge</Kicker>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              It answers.<br />You sleep.
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-paper/65">
              Trained on your guidebook only — so it answers like you would, and never makes
              things up. Last night it would have handled six questions before breakfast.
            </p>
            <Link href="/g/brygga" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-paper underline decoration-paper/40 underline-offset-8 hover:decoration-paper">
              Try asking it something <ArrowRight className="size-4" />
            </Link>
          </Reveal>
          <Reveal delay={120}>
            <div className="max-w-md space-y-3 lg:ml-auto">
              <ChatBubble who="guest">What time is check-out? And can we leave our bags?</ChatBubble>
              <ChatBubble who="bot">
                Check-out is by <strong>11:00 AM</strong>. You&apos;re welcome to leave bags in the
                boathouse until 3 — the small key opens it 🔑
              </ChatBubble>
              <ChatBubble who="guest">Perfect. Anywhere good for breakfast?</ChatBubble>
              <ChatBubble who="bot">
                Ingrid&apos;s pick is <strong>Lyspunktet</strong> — great cinnamon buns, 10 minutes
                by car. It&apos;s pinned on your map.
              </ChatBubble>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================ FEATURES =========================== */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-28">
        <Reveal className="max-w-xl">
          <Kicker>Everything included</Kicker>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            More than a list of instructions.
          </h2>
        </Reveal>

        <Reveal delay={100} className="mt-14 border-t border-line">
          {features.map(([name, desc], i) => (
            <div key={name} className="group grid gap-2 border-b border-line py-7 transition-colors hover:bg-paper-2/50 md:grid-cols-[72px_1fr_1.3fr] md:items-baseline md:gap-8">
              <span className="font-display text-sm text-clay">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-2xl font-semibold tracking-tight">{name}</h3>
              <p className="leading-relaxed text-muted">{desc}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ========================== CASE STUDY =========================== */}
      <section className="relative isolate overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG.caseStudy} alt="A bright, welcoming rental apartment" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-night/90 via-night/40 to-night/10" />
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-72">
          <Reveal>
            <div className="max-w-2xl">
              <Kicker light>The guest experience</Kicker>
              <p className="mt-5 font-display text-3xl font-medium leading-snug text-paper sm:text-4xl">
                Guests shouldn&apos;t have to text you to find the Wi-Fi. Give them one beautiful
                link with everything they need — and let AI answer the rest.
              </p>
            </div>
            <div className="mt-12 flex max-w-xl divide-x divide-paper/20 border-t border-paper/20 pt-7">
              {[["One link", "all guest info"], ["24/7", "AI concierge"], ["In-app", "upsells & orders"]].map(([a, b], i) => (
                <div key={b} className={i === 0 ? "pr-8" : "px-8"}>
                  <div className="font-display text-3xl font-semibold text-paper">{a}</div>
                  <div className="mt-1 text-xs text-paper/55">{b}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========================= HOW IT WORKS ========================== */}
      <section className="mx-auto max-w-6xl px-5 py-28">
        <Reveal className="max-w-xl">
          <Kicker>How it works</Kicker>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Live in three steps.
          </h2>
          <p className="mt-4 text-lg text-muted">From empty to a guide guests love — in about ten minutes.</p>
        </Reveal>
        <div className="mt-14 grid border-y border-line md:grid-cols-3 md:divide-x md:divide-line">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 100}>
              <div className={`flex h-full flex-col py-10 ${i === 0 ? "md:pr-10" : i === 1 ? "md:px-10" : "md:pl-10"} ${i > 0 ? "border-t border-line md:border-t-0" : ""}`}>
                <span className="font-display text-sm text-clay">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-5 font-display text-xl font-medium">{s.title}</h3>
                <p className="mt-4 flex-1 leading-relaxed text-muted">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================ PRICING ============================ */}
      <section className="mx-auto max-w-6xl px-5 pb-28">
        <Reveal className="max-w-xl">
          <Kicker>Pricing</Kicker>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            One simple price, per property.
          </h2>
          <p className="mt-4 text-lg text-muted">Every feature included. The more you host, the less each one costs.</p>
        </Reveal>
        <Reveal delay={120} className="mt-12">
          <PricingCalculator theme="light" />
        </Reveal>
        <Reveal delay={160} className="mt-6 flex flex-wrap items-center gap-4">
          <Link href="/register" className="inline-flex items-center gap-2 bg-night px-7 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-forest">
            Start your free trial <ArrowRight className="size-4" />
          </Link>
          <span className="text-sm text-muted">No credit card · Cancel anytime</span>
        </Reveal>
      </section>

      {/* ============================== FAQ ============================== */}
      <section id="faq" className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-28 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <Kicker>FAQ</Kicker>
            <h2 className="mt-5 font-display text-4xl font-semibold tracking-tight">Questions, answered.</h2>
            <p className="mt-5 max-w-xs text-muted">
              Still wondering? <Link href="/register" className="text-night underline decoration-night/30 underline-offset-4 hover:decoration-night">Start free</Link> and see it with your own property.
            </p>
          </Reveal>
          <div className="border-t border-line">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 50}>
                <details className="group border-b border-line">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-display text-lg font-medium">
                    {f.q}
                    <Plus className="size-4 shrink-0 text-muted transition-transform group-open:rotate-45" />
                  </summary>
                  <p className="max-w-xl pb-6 leading-relaxed text-muted">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ FINAL CTA =========================== */}
      <section className="relative isolate overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG.cta} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-night/75" />
        <div className="mx-auto max-w-3xl px-5 py-32 text-center">
          <Reveal>
            <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight text-paper sm:text-6xl">
              Be the host they rave about.
            </h2>
            <p className="mx-auto mt-6 max-w-md text-lg text-paper/70">
              Your first guidebook takes ten minutes — and it works the night shift forever.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-7">
              <Link href="/register" className="inline-flex items-center gap-2.5 bg-paper px-8 py-4 text-sm font-semibold text-night transition-colors hover:bg-white">
                Start free today <ArrowRight className="size-4" />
              </Link>
              <Link href="/g/brygga" className="text-sm font-medium text-paper underline decoration-paper/40 underline-offset-8 hover:decoration-paper">
                See a live guide first
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================= FOOTER ============================ */}
      <footer className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
            <div>
              <Wordmark />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
                Digital guidebooks for short-term rentals. Fewer questions, happier guests, better
                reviews.
              </p>
            </div>
            <FooterCol title="Product" links={[["Features", "#features"], ["Live demo", "/g/brygga"], ["Pricing", "/pricing"], ["Log in", "/login"]]} />
            <FooterCol title="Company" links={[["About", "#"], ["Journal", "#"], ["Contact", "#"]]} />
            <FooterCol title="Legal" links={[["Privacy", "/privacy"], ["Terms", "/terms"]]} />
          </div>
          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 text-sm text-muted sm:flex-row">
            <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
            <div className="flex items-center gap-5">
              {["English", "Norsk", "Deutsch", "Español"].map((l) => <span key={l} className="cursor-pointer hover:text-night">{l}</span>)}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* -------------------------------------------------------------- fragments --- */

/* iPhone 15 Pro outer dimensions from the mockup spec: 393+12*2 × 852+12*2. */
const PHONE_W = 417;
const PHONE_H = 876;

/** The mockup scales via CSS transform, so we wrap it in a box sized to the scaled result. */
function GuidePhone({ scale }: { scale: number }) {
  return (
    <div style={{ width: Math.round(PHONE_W * scale), height: Math.round(PHONE_H * scale) }}>
      <IPhoneMockup model="15-pro" color="natural-titanium" scale={scale} safeArea={false} screenBg="#fcfbf8">
        <GuideScreen />
      </IPhoneMockup>
    </div>
  );
}

/** The Cozio guest guide rendered as a realistic full-bleed app screen. */
function GuideScreen() {
  return (
    <div className="flex h-full w-full flex-col bg-paper">
      {/* Photo header — runs under the Dynamic Island like a real screenshot */}
      <div className="relative h-60 shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG.heroPhone} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-night/45 via-transparent to-night/80" />
        {/* iOS status bar */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-8 pt-4 text-paper">
          <span className="text-sm font-semibold tracking-tight">9:41</span>
          <span className="flex items-center gap-1.5">
            <Signal className="size-4" />
            <Wifi className="size-4" />
            <BatteryFull className="size-5" />
          </span>
        </div>
        <div className="absolute bottom-4 left-5 text-paper">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] opacity-80">Welcome to</div>
          <div className="font-display text-3xl font-semibold leading-tight">Brygga</div>
          <div className="mt-1 flex items-center gap-1 text-xs opacity-85">
            <MapPin className="size-3" /> Ålesund, Norway
          </div>
        </div>
      </div>

      {/* Quick cards */}
      <div className="grid grid-cols-3 gap-2.5 px-4 pt-4">
        {[{ icon: Key, l: "Check-in" }, { icon: Wifi, l: "Wi-Fi" }, { icon: MapPin, l: "Map" }].map((c) => (
          <div key={c.l} className="rounded-2xl border border-line bg-white px-2 py-3.5 text-center shadow-sm">
            <c.icon className="mx-auto size-5 text-forest" />
            <div className="mt-1.5 text-[11px] font-semibold text-night">{c.l}</div>
          </div>
        ))}
      </div>

      {/* Topics */}
      <div className="space-y-2.5 px-4 pt-3.5">
        {[
          { icon: BookOpen, l: "House manual", s: "Heating, kitchen & the boathouse" },
          { icon: Calendar, l: "Before you leave", s: "Check-out by 11:00 AM" },
        ].map((r) => (
          <div key={r.l} className="flex items-center gap-3 rounded-2xl border border-line bg-white px-3.5 py-3 shadow-sm">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-forest/10 text-forest">
              <r.icon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold text-night">{r.l}</span>
              <span className="block truncate text-[11px] text-muted">{r.s}</span>
            </span>
            <ChevronDown className="ml-auto size-4 -rotate-90 text-muted" />
          </div>
        ))}
      </div>

      {/* Host pick + upsell */}
      <div className="space-y-2.5 px-4 pt-3.5">
        <div className="rounded-2xl bg-clay-soft px-3.5 py-3 text-xs leading-snug text-night">
          ⭐ <span className="font-semibold">Host pick:</span> Brosundet Restaurant — 12 min away
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-line bg-white px-3.5 py-3 shadow-sm">
          <span>
            <span className="block text-[13px] font-semibold text-night">Early check-in</span>
            <span className="block text-[11px] font-medium text-clay">€25 · per stay</span>
          </span>
          <span className="rounded-full bg-forest px-3.5 py-1.5 text-[11px] font-semibold text-paper">Request</span>
        </div>
      </div>

      {/* Concierge bar pinned above the home indicator */}
      <div className="mt-auto px-4 pb-8">
        <div className="flex items-center gap-2.5 rounded-full border border-line bg-white px-4 py-3 shadow-sm">
          <Sparkles className="size-4 text-forest" />
          <span className="text-xs text-muted">Ask me anything…</span>
          <Send className="ml-auto size-3.5 text-forest" />
        </div>
      </div>
    </div>
  );
}

function BrowserMock() {
  const sections = [
    { icon: Calendar, title: "Before you arrive", topics: "2 topics" },
    { icon: Home, title: "House manual", topics: "3 topics" },
    { icon: Shield, title: "House rules", topics: "1 topic" },
    { icon: Calendar, title: "Before you leave", topics: "1 topic" },
  ];
  return (
    <div className="overflow-hidden border border-line bg-paper shadow-2xl shadow-night/10">
      {/* Chrome */}
      <div className="flex items-center gap-3 border-b border-line bg-paper-2/70 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#f87171]" />
          <span className="size-2.5 rounded-full bg-[#fbbf24]" />
          <span className="size-2.5 rounded-full bg-[#34d399]" />
        </div>
        <div className="mx-auto flex w-full max-w-sm items-center justify-center gap-1.5 bg-paper px-4 py-1 text-[11px] text-muted">
          <span className="size-2 rounded-full bg-forest/30" /> cozio.eu/dashboard
        </div>
      </div>
      {/* App */}
      <div className="grid md:grid-cols-[190px_1fr]">
        {/* Sidebar */}
        <aside className="hidden border-r border-line bg-paper-2/40 p-3.5 md:block">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <span className="grid size-6 place-items-center bg-forest text-paper"><CozioMark className="size-3.5" /></span>
            <span className="font-display text-sm font-semibold">{APP_NAME}</span>
          </div>
          <nav className="mt-4 space-y-1">
            {[
              { icon: Home, l: "Properties", active: true },
              { icon: MessageSquare, l: "Memo messaging" },
              { icon: Plug, l: "Integrations" },
              { icon: CreditCard, l: "Plan & billing" },
            ].map((n) => (
              <div key={n.l} className={`flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium ${n.active ? "bg-forest/10 text-forest" : "text-muted"}`}>
                <n.icon className="size-3.5" /> {n.l}
              </div>
            ))}
          </nav>
        </aside>
        {/* Main */}
        <div className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-display text-lg font-semibold">Brygga — Harbour Apartment</div>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
                <span className="inline-flex items-center gap-1 bg-forest/10 px-2 py-0.5 font-medium text-forest"><span className="size-1.5 rounded-full bg-forest-600" /> Live</span>
                1,240 guest views
              </div>
            </div>
            <span className="bg-night px-3.5 py-1.5 text-[11px] font-semibold text-paper">View live ↗</span>
          </div>
          <div className="mt-4 flex gap-1.5 overflow-hidden">
            {["Content", "Recommendations", "Upsells", "Branding", "Analytics", "Preview"].map((t, i) => (
              <span key={t} className={`whitespace-nowrap px-3 py-1.5 text-[11px] font-medium ${i === 0 ? "bg-night text-paper" : "bg-paper-2 text-muted"}`}>{t}</span>
            ))}
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-2">
              {sections.map((s) => (
                <div key={s.title} className="flex items-center gap-3 border border-line bg-paper px-3.5 py-2.5">
                  <span className="grid size-7 place-items-center bg-forest/10 text-forest"><s.icon className="size-3.5" /></span>
                  <span className="text-xs font-semibold">{s.title}</span>
                  <span className="ml-auto text-[10px] text-muted">{s.topics}</span>
                </div>
              ))}
            </div>
            <div className="border border-line bg-paper p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold"><BarChart3 className="size-3.5 text-forest" /> Views — 14 days</div>
              <div className="mt-3 flex h-20 items-end gap-1">
                {[30, 45, 38, 55, 48, 70, 62, 80, 58, 88, 74, 95, 82, 90].map((h, i) => (
                  <div key={i} className="flex-1 bg-forest-600/70" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="mt-2.5 text-[10px] text-muted">Top topic: <span className="font-semibold text-night">Wi-Fi</span> · 312 opens</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ who, children }: { who: "guest" | "bot"; children: React.ReactNode }) {
  return (
    <div className={`flex ${who === "guest" ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${who === "guest" ? "rounded-br-sm bg-forest-600 text-paper" : "rounded-bl-sm bg-paper/10 text-paper/90"}`}>
        {children}
      </div>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-4 space-y-2.5 text-sm text-muted">
        {links.map(([l, href]) => <li key={l}><Link href={href} className="hover:text-night">{l}</Link></li>)}
      </ul>
    </div>
  );
}
