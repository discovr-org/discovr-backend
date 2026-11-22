import { NotFoundError, ValidationError } from "../domain/errors.js";
import type { ActionButton, Category, CategoryInput, CategoryLayout } from "../domain/experience.js";
import type { ExperienceRepository } from "./ports/experience-repository.js";

const slugOf = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

/** A layout is stored as sent; only its outline is checked so a bad save can't break the guest page. */
export function cleanLayout(value: unknown): CategoryLayout {
  if (!value || typeof value !== "object") return {};
  const v = value as { sections?: unknown; story?: unknown; actionButtons?: unknown };
  const layout: CategoryLayout = {};
  if (Array.isArray(v.actionButtons)) {
    const known: ActionButton[] = ["call", "directions", "instagram", "whatsapp", "website", "share"];
    const picked = [...new Set(v.actionButtons)].filter((b): b is ActionButton => known.includes(b as ActionButton));
    if (picked.length) layout.actionButtons = picked;
  }
  if (Array.isArray(v.sections)) {
    layout.sections = v.sections
      .filter((s): s is { id: string; show?: boolean } => !!s && typeof (s as { id?: unknown }).id === "string")
      .map((s) => (s.show === false ? { id: s.id, show: false } : { id: s.id }));
  }
  if (Array.isArray(v.story)) {
    layout.story = v.story
      .filter((b) => !!b && typeof b === "object" && typeof (b as { type?: unknown }).type === "string")
      // The admin sets content, not styling: spacing, per-device hiding and widths that older saves carry are dropped.
      .map((b) => {
        const { space: _space, hide: _hide, size: _size, ...rest } = b as Record<string, unknown>;
        return rest;
      });
  }
  return layout;
}

const MIN_WEIGHT = 1;
const MAX_WEIGHT = 1000;

/** A weight is a whole number from 1 to 1000. Anything else is refused, not rounded, so the admin sees the mistake. */
export function cleanWeight(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < MIN_WEIGHT || value > MAX_WEIGHT) {
    throw new ValidationError(`A weight is a whole number from ${MIN_WEIGHT} to ${MAX_WEIGHT}.`);
  }
  return value;
}

/** Categories: a name, a slug, the page layout every listing in it shares, and the weight that orders its home row. */
export class Categories {
  constructor(private readonly repo: ExperienceRepository) {}

  list(): Promise<Category[]> {
    return this.repo.listCategories();
  }

  async get(id: string): Promise<Category> {
    const c = await this.repo.getCategory(id);
    if (!c) throw new NotFoundError(`Category ${id} not found`);
    return c;
  }

  async create(input: { name?: unknown; slug?: unknown; layout?: unknown; weight?: unknown }): Promise<Category> {
    const name = typeof input.name === "string" ? input.name.trim() : "";
    if (!name) throw new ValidationError("Give the category a name.");
    const slug = (typeof input.slug === "string" && input.slug.trim() ? slugOf(input.slug) : slugOf(name)) || "category";
    return this.repo.createCategory({ name, slug, layout: cleanLayout(input.layout), weight: input.weight === undefined ? 1 : cleanWeight(input.weight) });
  }

  async update(id: string, input: { name?: unknown; slug?: unknown; layout?: unknown; weight?: unknown }): Promise<Category> {
    const patch: CategoryInput = {};
    if (typeof input.name === "string") {
      if (!input.name.trim()) throw new ValidationError("A category needs a name.");
      patch.name = input.name.trim();
    }
    if (typeof input.slug === "string") {
      const slug = slugOf(input.slug);
      if (!slug) throw new ValidationError("A category needs a slug.");
      patch.slug = slug;
    }
    if (input.layout !== undefined) patch.layout = cleanLayout(input.layout);
    if (input.weight !== undefined) patch.weight = cleanWeight(input.weight);
    if (Object.keys(patch).length === 0) throw new ValidationError("Nothing to update.");
    await this.get(id);
    return this.repo.updateCategory(id, patch);
  }

  /**
   * Set many weights at once (a drag renumbers several). Every id and weight is checked before anything is written.
   * Not atomic: the database is written one category at a time.
   */
  async setWeights(items: unknown): Promise<Category[]> {
    if (!Array.isArray(items) || items.length === 0) throw new ValidationError("Send a list of { id, weight }.");
    const known = new Set((await this.repo.listCategories()).map((c) => c.id));
    const clean = items.map((raw) => {
      const item = raw as { id?: unknown; weight?: unknown } | null;
      if (typeof item?.id !== "string" || !known.has(item.id)) throw new NotFoundError(`Category ${String(item?.id)} not found`);
      return { id: item.id, weight: cleanWeight(item.weight) };
    });
    for (const { id, weight } of clean) await this.repo.updateCategory(id, { weight });
    return this.repo.listCategories();
  }

  async remove(id: string): Promise<void> {
    await this.get(id);
    await this.repo.deleteCategory(id);
  }
}
