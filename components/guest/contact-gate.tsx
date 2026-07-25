"use client";

import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";

export function ContactGate({
  slug,
  brand,
  propertyName,
  required,
}: {
  slug: string;
  brand: string;
  propertyName: string;
  required: boolean;
}) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(`cozio_contact_${slug}`)) return;
    } catch {}
    setShow(true);
  }, [slug]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, name: fd.get("name"), email: fd.get("email"), phone: fd.get("phone") }),
    });
    try { localStorage.setItem(`cozio_contact_${slug}`, "1"); } catch {}
    setLoading(false);
    setShow(false);
  }

  function skip() {
    try { localStorage.setItem(`cozio_contact_${slug}`, "1"); } catch {}
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-ink-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-ink-900">Welcome to {propertyName}</h3>
            <p className="mt-1 text-sm text-ink-500">Leave your details so your host can reach you during your stay.</p>
          </div>
          {!required && (
            <button onClick={skip} className="rounded-lg p-1 text-ink-400 hover:bg-ink-100"><X className="size-5" /></button>
          )}
        </div>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <input name="name" placeholder="Your name" required className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
          <input name="email" type="email" placeholder="Email" required className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
          <input name="phone" placeholder="Phone (optional)" className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
          <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-white" style={{ background: brand }}>
            {loading && <Loader2 className="size-4 animate-spin" />} Continue to guidebook
          </button>
          {!required && <button type="button" onClick={skip} className="w-full text-center text-xs text-ink-400">Skip for now</button>}
        </form>
      </div>
    </div>
  );
}
