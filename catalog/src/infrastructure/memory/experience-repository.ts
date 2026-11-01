import type { ExperienceRepository } from "../../application/ports/experience-repository.js";
import type { Experience, FeedSection } from "../../domain/experience.js";
import { seedExperiences, seedFeed } from "./seed.js";

export class MemoryExperienceRepository implements ExperienceRepository {
  constructor(
    private readonly experiences: Experience[] = seedExperiences,
    private readonly feed: FeedSection[] = seedFeed,
  ) {}

  async getBySlug(slug: string): Promise<Experience | null> {
    return this.experiences.find((e) => e.slug === slug) ?? null;
  }

  async listFeed(): Promise<FeedSection[]> {
    return this.feed;
  }
}
