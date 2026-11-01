import { NotFoundError } from "../domain/errors.js";
import type { ExperienceAdmin } from "../domain/experience.js";
import type { ExperienceRepository } from "./ports/experience-repository.js";

export class GetAdminExperience {
  constructor(private readonly repo: ExperienceRepository) {}

  async execute(id: string): Promise<ExperienceAdmin> {
    const row = await this.repo.getAdminById(id);
    if (!row) throw new NotFoundError(`Experience ${id} not found`);
    return row;
  }
}
