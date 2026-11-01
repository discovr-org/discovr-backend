import { NotFoundError } from "../domain/errors.js";
import type { Experience } from "../domain/experience.js";
import type { ExperienceRepository } from "./ports/experience-repository.js";

export class GetExperience {
  constructor(private readonly repo: ExperienceRepository) {}

  async execute(slug: string): Promise<Experience> {
    const trimmed = slug.trim();
    if (!trimmed) {
      throw new NotFoundError("Experience not found");
    }
    const experience = await this.repo.getBySlug(trimmed);
    if (!experience) {
      throw new NotFoundError(`No published experience for slug "${trimmed}"`);
    }
    return experience;
  }
}
