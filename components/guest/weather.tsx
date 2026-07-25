"use client";

import { useEffect, useState } from "react";

type Forecast = {
  current: { temp: number; code: number };
  days: { label: string; max: number; min: number; code: number }[];
};

// WMO weather codes → emoji + label
function describe(code: number): { icon: string; label: string } {
  if (code === 0) return { icon: "☀️", label: "Clear" };
  if (code <= 2) return { icon: "🌤️", label: "Partly cloudy" };
  if (code === 3) return { icon: "☁️", label: "Overcast" };
  if (code === 45 || code === 48) return { icon: "🌫️", label: "Fog" };
  if (code <= 57) return { icon: "🌦️", label: "Drizzle" };
  if (code <= 67) return { icon: "🌧️", label: "Rain" };
  if (code <= 77) return { icon: "❄️", label: "Snow" };
  if (code <= 82) return { icon: "🌧️", label: "Showers" };
  if (code <= 86) return { icon: "🌨️", label: "Snow showers" };
  return { icon: "⛈️", label: "Thunderstorm" };
}

export function Weather({ lat, lng }: { lat: number; lng: number }) {
  const [data, setData] = useState<Forecast | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
          `&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min` +
          `&timezone=auto&forecast_days=4`;
        const res = await fetch(url);
        if (!res.ok) return;
        const j = await res.json();
        if (cancelled) return;
        const days = (j.daily?.time as string[] | undefined)?.slice(1).map((iso, i) => ({
          label: new Date(iso).toLocaleDateString(undefined, { weekday: "short" }),
          max: Math.round(j.daily.temperature_2m_max[i + 1]),
          min: Math.round(j.daily.temperature_2m_min[i + 1]),
          code: j.daily.weather_code[i + 1],
        }));
        setData({
          current: { temp: Math.round(j.current.temperature_2m), code: j.current.weather_code },
          days: days ?? [],
        });
      } catch {
        /* weather is decorative — fail silently */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  if (!data) return null;
  const now = describe(data.current.code);

  return (
    <div className="surface-flat flex items-center gap-4 overflow-x-auto rounded-2xl px-4 py-3.5">
      <div className="flex shrink-0 items-center gap-2.5 pr-4" style={{ borderRight: "1px solid var(--color-ink-100)" }}>
        <span className="text-2xl leading-none">{now.icon}</span>
        <span>
          <span className="block text-lg font-semibold leading-tight text-ink-900">{data.current.temp}°</span>
          <span className="block text-[11px] text-ink-400">{now.label}</span>
        </span>
      </div>
      {data.days.map((d) => (
        <div key={d.label} className="shrink-0 text-center">
          <div className="text-[11px] font-medium text-ink-400">{d.label}</div>
          <div className="text-base leading-tight">{describe(d.code).icon}</div>
          <div className="text-[11px] text-ink-500">
            <span className="font-semibold text-ink-800">{d.max}°</span> {d.min}°
          </div>
        </div>
      ))}
    </div>
  );
}
