import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/** Short, unguessable, URL-safe code (lowercase a–z0–9). ~78 billion combos at length 7. */
export function randomCode(len = 7): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < len; i++) out += (bytes[i] % 36).toString(36);
  return out;
}

/**
 * Generate a unique, unguessable slug: a readable root plus a random code, e.g.
 * `harbour-apartment-k7m2x9`. The code makes guide URLs impossible to guess or
 * enumerate, so they can be shared with guests without a login.
 */
export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const root = slugify(base) || "guide";
  let slug = `${root}-${randomCode()}`;
  while (await exists(slug)) {
    slug = `${root}-${randomCode()}`;
  }
  return slug;
}

/**
 * Safely embed a user-supplied URL inside a CSS `url(...)`. Strips characters
 * that could break out of the function and inject extra declarations.
 */
export function cssUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  const safe = url.replace(/["'()\\\s]/g, encodeURIComponent);
  return `url("${safe}")`;
}

/** Great-circle distance in km between two lat/lng points (haversine). */
export function distanceKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Human label for a distance, with a rough walk-time estimate. */
export function distanceLabel(km: number): string {
  if (km < 1) {
    const m = Math.round(km * 1000);
    const mins = Math.max(1, Math.round((km * 1000) / 80)); // ~80 m/min walking
    return `${m} m · ${mins} min walk`;
  }
  if (km < 3) return `${km.toFixed(1)} km · ${Math.round((km * 1000) / 80)} min walk`;
  return `${km.toFixed(1)} km away`;
}

export function initials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
