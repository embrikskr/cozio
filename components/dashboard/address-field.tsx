"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Check } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import type { Place } from "@/lib/geocode";

/**
 * Address input with suggestions. Replaces the latitude and longitude boxes
 * that used to sit next to it — nobody knows their coordinates, and the guide
 * needs them for directions, weather and the map. Picking a suggestion fills
 * them in silently.
 *
 * Typing a free-text address still works: it saves without coordinates, and the
 * caller decides what that costs (no map pin, no weather). Better than blocking
 * a host whose address the geocoder has never heard of.
 */
export function AddressField({
  label = "Address",
  value,
  hasCoords,
  onPick,
  onTextChange,
  placeholder = "Start typing an address…",
}: {
  label?: string;
  value: string;
  hasCoords: boolean;
  /** Called when a suggestion is chosen — address plus its coordinates. */
  onPick: (place: Place) => void;
  /** Called on free typing, before anything is chosen. */
  onTextChange: (text: string) => void;
  placeholder?: string;
}) {
  const [results, setResults] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // Typing after a pick means the coordinates no longer match the text.
  const [dirty, setDirty] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const skipNextSearch = useRef(false);

  // Close when clicking outside.
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Debounced lookup. 350ms is long enough that a normal typist makes one
  // request per address rather than one per letter — this calls a fair-use
  // geocoder, so the restraint is the point.
  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    const q = value.trim();
    if (q.length < 3) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
        const data = await res.json().catch(() => ({}));
        if (!cancelled) {
          setResults(Array.isArray(data.places) ? data.places : []);
          setOpen(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [value]);

  function pick(place: Place) {
    skipNextSearch.current = true; // choosing shouldn't trigger another search
    setOpen(false);
    setResults([]);
    setDirty(false);
    onPick(place);
  }

  return (
    <div ref={boxRef} className="relative">
      <Label>{label}</Label>
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => {
            setDirty(true);
            onTextChange(e.target.value);
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 className="size-4 animate-spin text-ink-400" />
          ) : hasCoords && !dirty ? (
            <Check className="size-4 text-emerald-600" />
          ) : null}
        </span>
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-ink-200 bg-white shadow-lg">
          {results.map((r, i) => (
            <button
              key={`${r.lat},${r.lng},${i}`}
              type="button"
              onClick={() => pick(r)}
              className={`flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-ink-50 ${
                i > 0 ? "border-t border-ink-100" : ""
              }`}
            >
              <MapPin className="mt-0.5 size-4 shrink-0 text-ink-400" />
              <span className="text-ink-900">{r.label}</span>
            </button>
          ))}
        </div>
      )}

      <p className="mt-1.5 text-xs text-ink-400">
        {hasCoords && !dirty
          ? "Pinned — directions, weather and the map will use this location."
          : "Pick a suggestion to place it on the map. You can save a plain address too, but the map pin and weather need a pick."}
      </p>
    </div>
  );
}
