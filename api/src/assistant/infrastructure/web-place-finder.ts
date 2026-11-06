import { MAPS_HOSTS, parseMapsCoords } from "../domain/maps-link.js";
import type { PlaceFinder, PlaceMatch } from "../application/ports/place-finder.js";

const UA = "discovr-admin/1.0 (hello@discovr.in)"; // OpenStreetMap asks for an identifying agent

/**
 * Map links: read the coordinates (following a short link first).
 * Names: OpenStreetMap Nominatim, India only.
 * ponytail: Nominatim is thin on small shacks and allows ~1 request/second. Swap in Google
 * Places behind this same port if ops hit misses.
 */
export class WebPlaceFinder implements PlaceFinder {
  async find(query: string): Promise<PlaceMatch[]> {
    const q = query.trim();
    if (/^https?:\/\//i.test(q)) return this.fromLink(q);
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.search = new URLSearchParams({ q, format: "jsonv2", limit: "5", countrycodes: "in" }).toString();
    const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error("Place search is down. Ask for a Google Maps link instead.");
    const rows = (await res.json()) as Array<{ name?: string; display_name: string; lat: string; lon: string }>;
    return rows.map((r) => ({
      name: r.name || r.display_name.split(",")[0],
      address: r.display_name,
      lat: Number(r.lat),
      lng: Number(r.lon),
    }));
  }

  private async fromLink(link: string): Promise<PlaceMatch[]> {
    let url = link;
    for (let hop = 0; hop < 4; hop++) {
      const coords = parseMapsCoords(url);
      if (coords) return [{ name: "Pin from map link", address: url, ...coords }];
      const host = new URL(url).hostname;
      if (!MAPS_HOSTS.has(host)) throw new Error("Only Google Maps links work. Paste one from Google Maps.");
      const res = await fetch(url, {
        redirect: "manual",
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(8000),
      });
      const next = res.headers.get("location");
      if (!next) break;
      url = new URL(next, url).toString();
    }
    throw new Error("That link has no pin in it. Open it in Google Maps, pick the place, and share that link.");
  }
}
