"use client";

import { useState } from "react";
import { Minus, Plus, Check } from "lucide-react";
import { monthlyTotal, annualTotal, avgPerProperty, PRICING, PRICING_INCLUDES } from "@/lib/constants";

/**
 * Touch Stay-style per-property pricing calculator. Pick how many properties
 * you have; the price scales with volume discounts. Works on the dark landing
 * and the light pricing page via the `theme` prop.
 */
export function PricingCalculator({
  theme = "light",
  showIncludes = true,
}: {
  theme?: "light" | "dark";
  showIncludes?: boolean;
}) {
  const [n, setN] = useState(1);
  const [annual, setAnnual] = useState(false);

  const monthly = monthlyTotal(n);
  const perMonth = annual ? Math.round(annualTotal(n) / 12) : monthly;
  const billed = annual ? annualTotal(n) : monthly;
  const avg = avgPerProperty(annual ? n : n); // monthly avg

  const dark = theme === "dark";
  const border = dark ? "border-paper/15" : "border-line";
  const muted = dark ? "text-paper/55" : "text-muted";
  const surface = dark ? "bg-paper/[0.04]" : "bg-paper-2/50";

  return (
    <div className={`grid gap-0 border ${border} md:grid-cols-[1.1fr_0.9fr]`}>
      {/* Left: the control */}
      <div className="p-8">
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${muted}`}>
            How many properties?
          </span>
          {/* Billing toggle */}
          <div className={`flex items-center gap-1 border ${border} p-0.5 text-xs`}>
            <button
              onClick={() => setAnnual(false)}
              className={`px-2.5 py-1 font-medium transition-colors ${!annual ? (dark ? "bg-paper text-night" : "bg-night text-paper") : muted}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-2.5 py-1 font-medium transition-colors ${annual ? (dark ? "bg-paper text-night" : "bg-night text-paper") : muted}`}
            >
              Annual
            </button>
          </div>
        </div>

        {/* Stepper */}
        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={() => setN((v) => Math.max(1, v - 1))}
            className={`grid size-11 place-items-center border ${border} transition-colors hover:opacity-70`}
            aria-label="Fewer properties"
          >
            <Minus className="size-4" />
          </button>
          <div className="flex-1 text-center">
            <input
              type="range"
              min={1}
              max={30}
              value={Math.min(n, 30)}
              onChange={(e) => setN(Number(e.target.value))}
              className="w-full accent-current"
              style={{ color: dark ? "#fff" : "#14402f" }}
            />
            <div className="mt-1 font-display text-2xl font-semibold">{n}{n >= 30 ? "+" : ""}</div>
          </div>
          <button
            onClick={() => setN((v) => v + 1)}
            className={`grid size-11 place-items-center border ${border} transition-colors hover:opacity-70`}
            aria-label="More properties"
          >
            <Plus className="size-4" />
          </button>
        </div>

        {/* Quick presets */}
        <div className="mt-5 flex flex-wrap gap-2">
          {[1, 3, 5, 10, 25].map((p) => (
            <button
              key={p}
              onClick={() => setN(p)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                n === p
                  ? dark ? "bg-paper text-night" : "bg-night text-paper"
                  : `border ${border} ${muted} hover:opacity-70`
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <p className={`mt-6 text-sm ${muted}`}>
          ${PRICING.bands[0].price} for your first property, then less for each one after — down to ${PRICING.bands[PRICING.bands.length - 1].price}/property.
        </p>
      </div>

      {/* Right: the result */}
      <div className={`flex flex-col justify-center border-t ${border} p-8 md:border-l md:border-t-0 ${surface}`}>
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-5xl font-semibold">${perMonth}</span>
          <span className={muted}>/month</span>
        </div>
        <p className={`mt-2 text-sm ${muted}`}>
          {annual ? (
            <>billed ${billed}/year · <span className="font-medium text-current">2 months free</span></>
          ) : (
            <>${avg.toFixed(2)} per property · or ${annualTotal(n)}/yr (2 months free)</>
          )}
        </p>
        <p className="mt-1 text-[13px]">
          {n} {n === 1 ? "property" : "properties"} · every feature included · cancel anytime
        </p>

        {showIncludes && (
          <ul className={`mt-6 space-y-2 text-sm ${muted}`}>
            {PRICING_INCLUDES.slice(0, 4).map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check className={`mt-0.5 size-4 shrink-0 ${dark ? "text-clay-soft" : "text-forest"}`} /> {f}
              </li>
            ))}
            <li className="text-xs opacity-70">…and everything else — every feature is included.</li>
          </ul>
        )}
      </div>
    </div>
  );
}
