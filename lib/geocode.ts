// Address lookup for the editor. Hosts type an address and pick from
// suggestions; the coordinates come along silently. They drive the guest
// guide's directions link, the weather widget and the map — a host should never
// have to find a latitude.
//
// Photon is an OpenStreetMap geocoder built for type-ahead, which matches the
// OSM tiles the guide map already uses, and needs no API key. It is a public
// instance on a fair-use basis: fine at our volume, not something to lean on
// once there is real traffic. Everything provider-specific is in this file, so
// swapping in Mapbox or Google later is one function, not a refactor.

const ENDPOINT = "https://photon.komoot.io/api/";

export type Place = {
  /** What the host sees in the suggestion list. */
  label: string;
  /** What we store on the property — street, number, postcode, city. */
  address: string;
  lat: number;
  lng: number;
};

type PhotonProps = {
  name?: string;
  housenumber?: string;
  street?: string;
  postcode?: string;
  city?: string;
  state?: string;
  country?: string;
};

function formatAddress(p: PhotonProps): string {
  const street = [p.street, p.housenumber].filter(Boolean).join(" ");
  // `name` is set for places like "Brosundet Restaurant" and empty for plain
  // house numbers, so it leads only when there is something to lead with.
  const head = p.name && p.name !== street ? p.name : street;
  return [head, [p.postcode, p.city].filter(Boolean).join(" "), p.country]
    .filter(Boolean)
    .join(", ");
}

/**
 * Search for a place by free text. Returns [] rather than throwing — a
 * suggestion list that fails to load should go quiet, not break the form.
 */
export async function searchPlaces(query: string, limit = 5): Promise<Place[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  const url = `${ENDPOINT}?q=${encodeURIComponent(q)}&limit=${limit}&lang=en`;
  try {
    const res = await fetch(url, {
      headers: {
        // Photon's fair-use policy asks callers to identify themselves.
        "User-Agent": "Cozio/1.0 (+https://cozio.eu)",
      },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];

    const data = (await res.json()) as {
      features?: { properties: PhotonProps; geometry: { coordinates: [number, number] } }[];
    };

    return (data.features ?? [])
      .map((f) => {
        // GeoJSON is [longitude, latitude] — the reverse of how everyone says it.
        const [lng, lat] = f.geometry.coordinates;
        const address = formatAddress(f.properties);
        return { label: address, address, lat, lng };
      })
      .filter((p) => p.address.length > 0 && Number.isFinite(p.lat) && Number.isFinite(p.lng));
  } catch {
    return [];
  }
}
