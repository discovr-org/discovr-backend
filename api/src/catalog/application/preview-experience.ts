import { NotFoundError } from "../domain/errors.js";
import type { CategoryLayout, Experience, ExperiencePatch } from "../domain/experience.js";
import type { ExperienceRepository } from "./ports/experience-repository.js";

export class PreviewExperience {
  constructor(private readonly repo: ExperienceRepository) {}

  async execute(id: string, patch: ExperiencePatch, layout?: CategoryLayout): Promise<Experience> {
    const preview = await this.repo.previewExperience(id, patch, layout);
    if (!preview) throw new NotFoundError(`Experience ${id} not found`);
    return preview;
  }
}
