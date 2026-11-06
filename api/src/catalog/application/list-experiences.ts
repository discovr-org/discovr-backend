import type { ExperienceSummary } from "../domain/experience.js";
import type { ExperienceRepository } from "./ports/experience-repository.js";
import { StaleCache } from "./stale-cache.js";

export class ListExperiences {
  private readonly cache: StaleCache<ExperienceSummary[]>;

  constructor(repo: ExperienceRepository) {
    this.cache = new StaleCache(() => repo.listExperiences());
  }

  execute(): Promise<ExperienceSummary[]> {
    return this.cache.get();
  }

  invalidate(): void {
    this.cache.invalidate();
  }
}
