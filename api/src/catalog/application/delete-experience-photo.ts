import { NotFoundError } from "../domain/errors.js";
import type { ExperienceAdmin } from "../domain/experience.js";
import { applyPhotos, requireAdminExperience } from "./experience-photos.js";
import type { ExperienceMediaRepository } from "./ports/experience-media-repository.js";
import type { ExperienceRepository } from "./ports/experience-repository.js";

/** Remove a carousel photo. If it was the cover, the next photo takes over. */
export class DeleteExperiencePhoto {
  constructor(
    private readonly repo: ExperienceRepository,
    private readonly media: ExperienceMediaRepository,
  ) {}

  async execute(experienceId: string, photoId: string): Promise<ExperienceAdmin> {
    const row = await requireAdminExperience(this.repo, experienceId);
    const photo = row.photos.find((p) => p.id === photoId);
    if (!photo) throw new NotFoundError(`Photo ${photoId} not found`);
    await this.media.deletePhoto(experienceId, photoId);

    const rest = row.photos.filter((p) => p.id !== photoId);
    const cover = rest.find((p) => p.isCover);
    if (cover) return requireAdminExperience(this.repo, experienceId);
    return applyPhotos(this.repo, this.media, experienceId, rest, rest[0]?.id ?? null);
  }
}
