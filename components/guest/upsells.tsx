"use client";

import { useState } from "react";
import { Loader2, Check, ShoppingBag } from "lucide-react";
import type { UpsellRow } from "@/lib/types";

export function Upsells({ slug, brand, upsells }: { slug: string; brand: string; upsells: UpsellRow[] }) {
  const [active, setActive] = useState<UpsellRow | null>(null);

  return (
    <div className="space-y-3">
      {upsells.map((u) => (
        <div key={u.id} className="overflow-hidden surface rounded-2xl">
          <div className="flex">
            {u.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={u.image} alt={u.title} className="h-auto w-28 shrink-0 object-cover" />
            )}
            <div className="flex flex-1 items-center justify-between gap-3 p-4">
              <div>
                <h3 className="font-semibold text-ink-900">{u.title}</h3>
                {u.description && <p className="mt-0.5 line-clamp-2 text-sm text-ink-600">{u.description}</p>}
                <div className="mt-1 text-sm font-bold" style={{ color: brand }}>
                  {u.currency} {u.price.toFixed(0)} {u.unit && <span className="font-normal text-ink-400">{u.unit}</span>}
                </div>
              </div>
              <button
                onClick={() => setActive(u)}
                className="shrink-0 rounded-xl px-4 py-2 text-sm font-medium text-white"
                style={{ background: brand }}
              >
                Request
              </button>
            </div>
          </div>
        </div>
      ))}

      {active && <RequestDialog slug={slug} brand={brand} upsell={active} onClose={() => setActive(null)} />}
    </div>
  );
}

function RequestDialog({ slug, brand, upsell, onClose }: { slug: string; brand: string; upsell: UpsellRow; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        upsellId: upsell.id,
        quantity: Number(fd.get("quantity")) || 1,
        guestName: fd.get("name"),
        guestEmail: fd.get("email"),
        note: fd.get("note"),
      }),
    });
    setLoading(false);
    if (res.ok) setDone(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/40 p-4 sm:items-center" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div className="py-6 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-100">
              <Check className="size-6 text-emerald-600" />
            </div>
            <h3 className="mt-3 text-lg font-semibold text-ink-900">Request sent!</h3>
            <p className="mt-1 text-sm text-ink-500">Your host will confirm <strong>{upsell.title}</strong> shortly.</p>
            <button onClick={onClose} className="mt-5 w-full rounded-xl py-2.5 text-sm font-medium text-white" style={{ background: brand }}>Done</button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <ShoppingBag className="size-5" style={{ color: brand }} />
              <h3 className="text-lg font-semibold text-ink-900">{upsell.title}</h3>
            </div>
            <p className="mt-1 text-sm font-medium" style={{ color: brand }}>{upsell.currency} {upsell.price.toFixed(0)} {upsell.unit}</p>
            <form onSubmit={submit} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input name="name" placeholder="Your name" className="rounded-xl border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
                <input name="email" type="email" placeholder="Email" className="rounded-xl border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-ink-500">Qty</label>
                <input name="quantity" type="number" min={1} max={20} defaultValue={1} className="w-20 rounded-xl border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
              </div>
              <textarea name="note" rows={2} placeholder="Anything we should know? (dates, preferences…)" className="w-full rounded-xl border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-white" style={{ background: brand }}>
                {loading && <Loader2 className="size-4 animate-spin" />} Send request
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
