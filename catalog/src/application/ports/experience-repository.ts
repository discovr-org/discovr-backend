import type { Experience, FeedSection } from "../../domain/experience.js";

/** Port: catalog persistence. Adapters: memory, supabase. */
export interface ExperienceRepository {
  getBySlug(slug: string): Promise<Experience | null>;
  listFeed(): Promise<FeedSection[]>;
}
