"use client";

import { useState } from "react";
import { Loader2, Sparkles, ChevronLeft, Wand2 } from "lucide-react";
import type { Itinerary } from "@/lib/ai";

const INTERESTS = ["Foodie", "Outdoors", "Culture", "Family", "Nightlife", "Relaxed"];

export function TripPlanner({
  slug,
  brand,
  onClose,
}: {
  slug: string;
  brand: string;
  onClose: () => void;
}) {
  const [days, setDays] = useState(2);
  const [picked, setPicked] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<Itinerary | null>(null);
  const [error, setError] = useState("");

  function toggle(i: string) {
    setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
  }

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, days, interests: picked }),
      });
      const data = await res.json();
      if (data.itinerary) setPlan(data.itinerary);
      else setError(data.error || "Couldn't build a plan — try again.");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-ink-950/30" onClick={onClose}>
      <div className="flex h-full w-full max-w-2xl flex-col bg-ink-50" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center gap-1.5 border-b border-ink-200 bg-white px-2.5 py-3">
          <button onClick={onClose} className="grid size-10 place-items-center rounded-full text-ink-600 active:bg-ink-100">
            <ChevronLeft className="size-5.5" />
          </button>
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
            <Sparkles className="size-4" style={{ color: brand }} /> AI trip planner
          </h2>
        </header>

        <div className="flex-1 overflow-y-auto p-5 pb-[max(env(safe-area-inset-bottom),1.25rem)]">
          {!plan ? (
            <div className="space-y-6">
              <p className="text-sm text-ink-500">
                Tell us a little about your trip and we&apos;ll plan your days around your host&apos;s favourite places.
              </p>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-ink-800">How many days?</h3>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDays(d)}
                      className="size-11 rounded-2xl border text-sm font-semibold transition-colors"
                      style={
                        days === d
                          ? { background: brand, color: "white", borderColor: brand }
                          : { borderColor: "var(--color-ink-200)", color: "var(--color-ink-600)", background: "white" }
                      }
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-ink-800">What are you into?</h3>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((i) => {
                    const on = picked.includes(i);
                    return (
                      <button
                        key={i}
                        onClick={() => toggle(i)}
                        className="rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors"
                        style={
                          on
                            ? { background: brand, color: "white", borderColor: brand }
                            : { borderColor: "var(--color-ink-200)", color: "var(--color-ink-600)", background: "white" }
                        }
                      >
                        {i}
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                onClick={generate}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-white"
                style={{ background: brand }}
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
                {loading ? "Planning your trip…" : "Create my plan"}
              </button>
            </div>
          ) : (
            <div>
              <h3 className="font-display text-2xl font-semibold text-ink-900">{plan.title}</h3>
              {plan.intro && <p className="mt-1.5 text-sm text-ink-500">{plan.intro}</p>}

              <div className="mt-6 space-y-6">
                {plan.days.map((day, di) => (
                  <div key={di}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="grid size-7 place-items-center rounded-full text-xs font-bold text-white" style={{ background: brand }}>
                        {di + 1}
                      </span>
                      <h4 className="font-display text-lg font-semibold text-ink-900">{day.label}</h4>
                    </div>
                    <div className="ml-3.5 space-y-3 border-l-2 border-ink-200 pl-5">
                      {day.items.map((it, ii) => (
                        <div key={ii} className="relative">
                          <span className="absolute -left-[1.6rem] top-1 size-3 rounded-full border-2 border-white" style={{ background: brand }} />
                          <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: brand }}>{it.time}</div>
                          <div className="text-sm font-semibold text-ink-900">{it.title}</div>
                          {it.note && <div className="text-sm text-ink-500">{it.note}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setPlan(null)}
                className="mt-7 w-full rounded-2xl border border-ink-200 bg-white py-3 text-sm font-semibold text-ink-700"
              >
                Plan again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
