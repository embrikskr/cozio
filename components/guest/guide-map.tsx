"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { RecommendationRow } from "@/lib/types";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function GuideMap({
  brand,
  lat,
  lng,
  name,
  recs,
}: {
  brand: string;
  lat: number | null;
  lng: number | null;
  name: string;
  recs: RecommendationRow[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default as typeof import("leaflet");
      if (cancelled || !ref.current || mapRef.current) return;

      const map = L.map(ref.current, { scrollWheelZoom: false });
      mapRef.current = map;

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Default leaflet marker images break under bundlers; use divIcon pins instead.
      const pin = (color: string, label: string) =>
        L.divIcon({
          className: "",
          html: `<div style="display:grid;place-items:center;width:30px;height:30px;border-radius:9999px;background:${color};color:#fff;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35);font-size:13px;line-height:1">${label}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
          popupAnchor: [0, -16],
        });

      const pts: [number, number][] = [];

      if (lat != null && lng != null) {
        L.marker([lat, lng], { icon: pin("#181611", "🏠") })
          .addTo(map)
          .bindPopup(`<b>${esc(name)}</b>`);
        pts.push([lat, lng]);
      }

      for (const r of recs) {
        if (r.lat == null || r.lng == null) continue;
        const extra = [r.walkingTime, r.description].filter(Boolean).map((x) => esc(String(x)));
        L.marker([r.lat, r.lng], { icon: pin(brand, "★") })
          .addTo(map)
          .bindPopup(
            `<b>${esc(r.name)}</b>${extra.length ? `<br/><span style="color:#6e6a60">${extra[0]}</span>` : ""}`,
          );
        pts.push([r.lat, r.lng]);
      }

      if (pts.length > 1) map.fitBounds(pts, { padding: [42, 42] });
      else if (pts.length === 1) map.setView(pts[0], 13);
      else map.setView([51.5, 10.5], 4);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [brand, lat, lng, name, recs]);

  return <div ref={ref} className="h-[44vh] min-h-72 w-full" />;
}
