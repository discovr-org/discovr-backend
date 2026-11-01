import type { ExperienceSummary } from "../domain/experience.js";
import type { ExperienceRepository } from "./ports/experience-repository.js";

export class ListExperiences {
  constructor(private readonly repo: ExperienceRepository) {}

  execute(): Promise<ExperienceSummary[]> {
    return this.repo.listExperiences();
  }
}
