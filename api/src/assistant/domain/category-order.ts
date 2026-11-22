/**
 * The order of category rows on the guest home page, and the weights that make a chosen order.
 * Mirrors the admin's `weights.ts` and the guest app's `buildHomeSections`: keep the three in step.
 */
export const MIN_WEIGHT = 1;
export const MAX_WEIGHT = 1000;

type Ranked = { id: string; slug: string; name: string; weight: number };

const norm = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Heaviest first. Equal weights go in the Home feed's order (a row whose id or title is the category's slug or name), then by name. */
export function orderCategories<T extends Ranked>(rows: T[], home: Array<{ id: string; title: string }>): T[] {
  const at = (c: Ranked) => {
    const i = home.findIndex((s) => s.id === c.slug || norm(s.title) === norm(c.name));
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  return [...rows].sort((a, b) => b.weight - a.weight || at(a) - at(b) || a.name.localeCompare(b.name));
}

/** Weights that give exactly this order (first = heaviest): spread evenly from 1000 down, all different. */
export function weightsForOrder(ids: string[]): Array<{ id: string; weight: number }> {
  const step = ids.length > 1 ? Math.floor((MAX_WEIGHT - MIN_WEIGHT) / (ids.length - 1)) : 0;
  return ids.map((id, i) => ({ id, weight: MAX_WEIGHT - i * step }));
}

/** The listed categories go first, in the order given; the rest keep the order they already have. */
export function finalOrder<T extends { id: string }>(current: T[], first: string[]): T[] {
  const byId = new Map(current.map((c) => [c.id, c]));
  const unknown = first.filter((id) => !byId.has(id));
  if (unknown.length) throw new Error(`Unknown category id${unknown.length === 1 ? "" : "s"}: ${unknown.join(", ")}. Get ids from list_category_layouts.`);
  if (new Set(first).size !== first.length) throw new Error("A category is listed twice.");
  return [...first.map((id) => byId.get(id)!), ...current.filter((c) => !first.includes(c.id))];
}
