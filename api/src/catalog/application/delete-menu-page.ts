import { NotFoundError } from "../domain/errors.js";
import type { ExperienceAdmin } from "../domain/experience.js";
import { requireAdminExperience } from "./experience-photos.js";
import type { ExperienceMediaRepository } from "./ports/experience-media-repository.js";
import type { ExperienceRepository } from "./ports/experience-repository.js";

export class DeleteMenuPage {
  constructor(
    private readonly repo: ExperienceRepository,
    private readonly media: ExperienceMediaRepository,
  ) {}

  async execute(experienceId: string, pageId: string): Promise<ExperienceAdmin> {
    const row = await requireAdminExperience(this.repo, experienceId);
    if (!row.menuPages.some((p) => p.id === pageId)) {
      throw new NotFoundError(`Menu page ${pageId} not found`);
    }
    await this.media.deleteMenuPage(experienceId, pageId);
    return requireAdminExperience(this.repo, experienceId);
  }
}
