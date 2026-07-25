"use client";

import { useState, useEffect } from "react";
import { Star, X, Loader2 } from "lucide-react";

export function ReviewPopup({ slug, brand, propertyName }: { slug: string; brand: string; propertyName: string }) {
  const [show, setShow] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(`cozio_reviewed_${slug}`)) return;
    } catch {}
    const t = setTimeout(() => setShow(true), 20000); // appear after 20s
    return () => clearTimeout(t);
  }, [slug]);

  function dismiss() {
    setShow(false);
    try { localStorage.setItem(`cozio_reviewed_${slug}`, "1"); } catch {}
  }

  async function submit(feedback?: string) {
    setLoading(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, rating, feedback }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    try { localStorage.setItem(`cozio_reviewed_${slug}`, "1"); } catch {}
    if (data.routeTo) {
      window.location.href = data.routeTo;
      return;
    }
    setSubmitted(true);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:bottom-5 sm:left-auto sm:right-5 sm:w-96">
      <div className="relative rounded-2xl border border-ink-200 bg-white p-5 shadow-2xl">
        <button onClick={dismiss} className="absolute right-3 top-3 rounded-lg p-1 text-ink-400 hover:bg-ink-100"><X className="size-4" /></button>

        {submitted ? (
          <div className="py-3 text-center">
            <h3 className="font-semibold text-ink-900">Thank you! 💛</h3>
            <p className="mt-1 text-sm text-ink-500">Your feedback helps us make your stay better.</p>
          </div>
        ) : rating === 0 ? (
          <>
            <h3 className="font-semibold text-ink-900">Enjoying your stay at {propertyName}?</h3>
            <p className="mt-1 text-sm text-ink-500">Tap a star to rate your experience.</p>
            <div className="mt-3 flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => setRating(n)}>
                  <Star className={`size-8 transition-colors ${n <= (hover || rating) ? "fill-amber-400 text-amber-400" : "text-ink-200"}`} />
                </button>
              ))}
            </div>
          </>
        ) : rating >= 4 ? (
          <div className="text-center">
            <div className="mb-2 flex justify-center gap-1">
              {Array.from({ length: rating }).map((_, i) => <Star key={i} className="size-6 fill-amber-400 text-amber-400" />)}
            </div>
            <h3 className="font-semibold text-ink-900">Wonderful! 🎉</h3>
            <p className="mt-1 text-sm text-ink-500">Would you mind sharing it publicly?</p>
            <button onClick={() => submit()} disabled={loading} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-white" style={{ background: brand }}>
              {loading && <Loader2 className="size-4 animate-spin" />} Leave a review
            </button>
          </div>
        ) : (
          <PrivateFeedback brand={brand} loading={loading} onSubmit={submit} />
        )}
      </div>
    </div>
  );
}

function PrivateFeedback({ brand, loading, onSubmit }: { brand: string; loading: boolean; onSubmit: (f: string) => void }) {
  const [text, setText] = useState("");
  return (
    <div>
      <h3 className="font-semibold text-ink-900">Sorry to hear that.</h3>
      <p className="mt-1 text-sm text-ink-500">Tell your host what could be better — this stays private.</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="What happened?" className="mt-3 w-full rounded-xl border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
      <button onClick={() => onSubmit(text)} disabled={loading} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-white" style={{ background: brand }}>
        {loading && <Loader2 className="size-4 animate-spin" />} Send privately
      </button>
    </div>
  );
}
