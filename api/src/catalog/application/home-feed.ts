import { ValidationError } from "../domain/errors.js";
import type { HomeSection } from "../domain/experience.js";
import type { ExperienceRepository } from "./ports/experience-repository.js";

const MAX_SECTIONS = 40;
const MAX_SLUGS = 40;

/** Keeps the shape the guest home reads. Anything else is dropped, so a bad save can't break the page. */
export function cleanHomeSections(value: unknown): HomeSection[] {
  if (!Array.isArray(value)) throw new ValidationError("Send a list of sections.");
  const seen = new Set<string>();
  return value.slice(0, MAX_SECTIONS).flatMap((raw) => {
    const s = raw as { id?: unknown; title?: unknown; layout?: unknown; slugs?: unknown } | null;
    const title = typeof s?.title === "string" ? s.title.trim() : "";
    if (!title) return [];
    let id = typeof s?.id === "string" && s.id.trim() ? s.id.trim() : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    while (seen.has(id)) id += "-2";
    seen.add(id);
    const slugs = Array.isArray(s?.slugs) ? s.slugs.filter((x): x is string => typeof x === "string" && x.length > 0) : [];
    return [{ id, title, layout: s?.layout === "stack" ? ("stack" as const) : ("rail" as const), slugs: [...new Set(slugs)].slice(0, MAX_SLUGS) }];
  });
}

/** The home page's sections, in order. `null` = never edited; the guest app keeps its built-in feed. */
export class HomeFeed {
  constructor(private readonly repo: ExperienceRepository) {}

  get(): Promise<HomeSection[] | null> {
    return this.repo.getHomeFeed();
  }

  save(input: unknown): Promise<HomeSection[]> {
    return this.repo.saveHomeFeed(cleanHomeSections(input));
  }
}
