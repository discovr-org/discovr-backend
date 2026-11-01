import type { HostSummary } from "../domain/experience.js";
import type { ExperienceRepository } from "./ports/experience-repository.js";

export class ListHosts {
  constructor(private readonly repo: ExperienceRepository) {}

  execute(): Promise<HostSummary[]> {
    return this.repo.listHosts();
  }
}
