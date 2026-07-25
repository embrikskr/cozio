"use client";

import { useState } from "react";
import { Star, ExternalLink, Navigation, MapPin } from "lucide-react";
import { Icon } from "@/components/icon";
import { REC_CATEGORIES } from "@/lib/constants";
import { distanceKm, distanceLabel } from "@/lib/utils";
import type { RecommendationRow } from "@/lib/types";

export function Recommendations({
  recommendations,
  brand,
  origin,
}: {
  recommendations: RecommendationRow[];
  brand: string;
  origin?: { lat: number; lng: number };
}) {
  const [filter, setFilter] = useState<string>("all");

  const usedCategories = Array.from(new Set(recommendations.map((r) => r.category)));
  const filtered = filter === "all" ? recommendations : recommendations.filter((r) => r.category === filter);

  // Host-set walking time wins; otherwise compute straight-line distance.
  function distanceText(r: RecommendationRow): string | null {
    if (r.walkingTime) return r.walkingTime;
    if (origin && r.lat != null && r.lng != null) {
      return distanceLabel(distanceKm(origin.lat, origin.lng, r.lat, r.lng));
    }
    return null;
  }

  function mapsLink(r: RecommendationRow) {
    if (r.lat && r.lng) return `https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lng}`;
    const q = encodeURIComponent([r.name, r.address].filter(Boolean).join(" "));
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  }

  return (
    <div>
      {/* Category filter */}
      <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
        <FilterPill active={filter === "all"} onClick={() => setFilter("all")} brand={brand}>
          All
        </FilterPill>
        {usedCategories.map((cat) => {
          const meta = REC_CATEGORIES.find((c) => c.value === cat);
          return (
            <FilterPill key={cat} active={filter === cat} onClick={() => setFilter(cat)} brand={brand}>
              {meta?.label ?? cat}
            </FilterPill>
          );
        })}
      </div>

      <div className="space-y-3">
        {filtered.map((r) => {
          const meta = REC_CATEGORIES.find((c) => c.value === r.category);
          return (
            <div key={r.id} className="overflow-hidden surface rounded-2xl">
              {r.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.image} alt={r.name} className="h-36 w-full object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 text-xs text-ink-400">
                  <Icon name={meta?.icon ?? "map-pin"} className="size-3.5" />
                  <span>{meta?.label ?? r.category}</span>
                  {distanceText(r) && (
                    <>
                      <span>·</span>
                      <span>{distanceText(r)}</span>
                    </>
                  )}
                  {r.hostFavorite && (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: `${brand}15`, color: brand }}>
                      <Star className="size-3 fill-current" /> Host pick
                    </span>
                  )}
                </div>
                <h3 className="mt-1.5 font-semibold text-ink-900">{r.name}</h3>
                {r.description && <p className="mt-1 text-sm text-ink-600">{r.description}</p>}
                <div className="mt-3 flex gap-2">
                  <a
                    href={mapsLink(r)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50"
                  >
                    <Navigation className="size-3.5" /> Directions
                  </a>
                  {r.url && (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50"
                    >
                      <ExternalLink className="size-3.5" /> Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-ink-400">
            <MapPin className="mx-auto mb-2 size-5" /> Nothing here yet.
          </p>
        )}
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  brand,
  children,
}: {
  active: boolean;
  onClick: () => void;
  brand: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors"
      style={
        active
          ? { background: brand, color: "white", borderColor: brand }
          : { borderColor: "var(--color-ink-200)", color: "var(--color-ink-600)" }
      }
    >
      {children}
    </button>
  );
}
