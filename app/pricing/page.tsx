import Link from "next/link";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { CozioMark } from "@/components/cozio-mark";
import { APP_NAME, PRICING } from "@/lib/constants";
import { PricingCalculator } from "@/components/pricing-calculator";

export const metadata = { title: "Pricing" };

const faqs = [
  { q: "How does per-property pricing work?", a: `You pay for the properties you publish — $${PRICING.bands[0].price} for the first, and less for each one after as you scale. The price updates live in the calculator above.` },
  { q: "Is there a free trial?", a: `Yes — every new account gets a ${PRICING.trialDays}-day free trial. No credit card required to start.` },
  { q: "Can I add or remove properties anytime?", a: "Anytime. Your bill adjusts automatically — add a property in busy season, pause it when you're done." },
  { q: "What counts as a property?", a: "One property = one digital guidebook for one rental. Every feature is included on every property — no feature gates." },
  { q: "Do you offer annual billing?", a: `Yes — switch to annual in the calculator and get ${PRICING.annualMonthsFree} months free.` },
];

function Wordmark() {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5">
      <span className="grid size-7 place-items-center bg-forest text-paper"><CozioMark className="size-3.5" /></span>
      <span className="font-display text-xl font-semibold tracking-tight text-night">{APP_NAME}</span>
    </Link>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-paper text-night">
      <header className="border-b border-line">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5">
          <Wordmark />
          <div className="flex items-center gap-6">
            <Link href="/login" className="hidden text-sm text-muted hover:text-night sm:block">Log in</Link>
            <Link href="/register" className="bg-night px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-forest">
              Start free
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-28 pt-20">
        <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-muted">
          <span className="h-px w-9 bg-night/30" /> Pricing
        </div>
        <h1 className="mt-6 max-w-2xl font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          One simple price, per property.
        </h1>
        <p className="mt-6 max-w-md text-lg text-muted">
          Every feature on every property. The more you host, the less each one costs.
        </p>

        <div className="mt-12">
          <PricingCalculator theme="light" />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link href="/register" className="inline-flex items-center gap-2 bg-night px-7 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-forest">
            Start your {PRICING.trialDays}-day free trial <ArrowRight className="size-4" />
          </Link>
          <span className="text-sm text-muted">No credit card · Cancel anytime</span>
        </div>
        <p className="mt-4 text-sm font-medium text-forest">
          Cheaper per property than Touch Stay, Hostfully or GuestIntro — with every feature included.
        </p>

        <div className="mt-24 grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <h2 className="font-display text-3xl font-semibold tracking-tight">Pricing FAQ</h2>
          <div className="border-t border-line">
            {faqs.map((f) => (
              <details key={f.q} className="group border-b border-line">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-display text-lg font-medium">
                  {f.q}
                  <Plus className="size-4 shrink-0 text-muted transition-transform group-open:rotate-45" />
                </summary>
                <p className="max-w-xl pb-6 leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-night">
            <ArrowLeft className="size-4" /> Back to {APP_NAME}
          </Link>
        </div>
      </section>
    </div>
  );
}
