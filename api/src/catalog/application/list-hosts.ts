import type { HostSummary } from "../domain/experience.js";
import type { ExperienceRepository } from "./ports/experience-repository.js";
import { StaleCache } from "./stale-cache.js";

export class ListHosts {
  private readonly cache: StaleCache<HostSummary[]>;

  constructor(repo: ExperienceRepository) {
    this.cache = new StaleCache(() => repo.listHosts());
  }

  execute(): Promise<HostSummary[]> {
    return this.cache.get();
  }

  invalidate(): void {
    this.cache.invalidate();
  }
}
