"use client";

import { useState } from "react";
import { Loader2, Check, X, ChevronLeft } from "lucide-react";

export function CheckInSheet({
  slug,
  brand,
  propertyName,
  onClose,
  onDone,
}: {
  slug: string;
  brand: string;
  propertyName: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    if (!fd.get("agreedRules")) {
      setLoading(false);
      setError("Please confirm you agree to the house rules.");
      return;
    }
    const res = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        guestName: fd.get("guestName"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        arrivalDate: fd.get("arrivalDate"),
        arrivalTime: fd.get("arrivalTime"),
        partySize: fd.get("partySize"),
        agreedRules: true,
        notes: fd.get("notes"),
      }),
    });
    setLoading(false);
    if (res.ok) {
      try {
        localStorage.setItem(`cozio_checkin_${slug}`, "1");
      } catch {}
      setDone(true);
      onDone();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Something went wrong.");
    }
  }

  const field =
    "w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-ink-400 focus:outline-none";

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-ink-950/30" onClick={onClose}>
      <div className="flex h-full w-full max-w-2xl flex-col bg-ink-50" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center gap-1.5 border-b border-ink-200 bg-white px-2.5 py-3">
          <button onClick={onClose} className="grid size-10 place-items-center rounded-full text-ink-600 active:bg-ink-100">
            <ChevronLeft className="size-5.5" />
          </button>
          <h2 className="font-display text-lg font-semibold text-ink-900">Online check-in</h2>
        </header>

        <div className="flex-1 overflow-y-auto p-5 pb-[max(env(safe-area-inset-bottom),1.25rem)]">
          {done ? (
            <div className="grid place-items-center py-16 text-center">
              <div className="grid size-14 place-items-center rounded-full" style={{ background: `${brand}1a`, color: brand }}>
                <Check className="size-7" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-ink-900">You&apos;re all set!</h3>
              <p className="mt-1 max-w-xs text-sm text-ink-500">
                Thanks — your host at {propertyName} has your arrival details.
              </p>
              <button onClick={onClose} className="mt-6 rounded-2xl px-6 py-3 text-sm font-semibold text-white" style={{ background: brand }}>
                Back to guide
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <p className="text-sm text-ink-500">Let your host know when you&apos;ll arrive — it makes check-in smooth.</p>
              <input name="guestName" required placeholder="Full name" className={field} />
              <div className="grid grid-cols-2 gap-3">
                <input name="email" type="email" placeholder="Email" className={field} />
                <input name="phone" placeholder="Phone" className={field} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-ink-500">Arrival date</span>
                  <input name="arrivalDate" type="date" className={field} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-ink-500">Arrival time</span>
                  <input name="arrivalTime" type="time" className={field} />
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-ink-500">Number of guests</span>
                <input name="partySize" type="number" min={1} max={50} defaultValue={2} className={field} />
              </label>
              <textarea name="notes" rows={2} placeholder="Anything we should know? (early arrival, accessibility…)" className={field} />
              <label className="flex items-start gap-3 rounded-2xl border border-ink-200 bg-white p-4">
                <input name="agreedRules" type="checkbox" className="mt-0.5 size-4 accent-current" style={{ accentColor: brand }} />
                <span className="text-sm text-ink-700">
                  I&apos;ve read and agree to the house rules in this guide.
                </span>
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-white"
                style={{ background: brand }}
              >
                {loading && <Loader2 className="size-4 animate-spin" />} Complete check-in
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
