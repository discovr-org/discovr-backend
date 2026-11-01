import { NotFoundError } from "../domain/errors.js";
import type { ExperienceRepository } from "./ports/experience-repository.js";

export class DeleteExperience {
  constructor(private readonly repo: ExperienceRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repo.getAdminById(id);
    if (!existing) throw new NotFoundError(`Experience ${id} not found`);
    await this.repo.deleteExperience(id);
  }
}
