import { ValidationError } from "../domain/errors.js";
import type { ExperienceAdmin } from "../domain/experience.js";
import {
  applyPhotos,
  assertSameIds,
  cleanAlt,
  requireAdminExperience,
} from "./experience-photos.js";
import type { ExperienceMediaRepository } from "./ports/experience-media-repository.js";
import type { ExperienceRepository } from "./ports/experience-repository.js";

/** Reorder carousel photos, edit alt text, pick the cover. */
export class UpdateExperiencePhotos {
  constructor(
    private readonly repo: ExperienceRepository,
    private readonly media: ExperienceMediaRepository,
  ) {}

  async execute(
    experienceId: string,
    items: Array<{ id: string; alt?: string }>,
    coverId: string | null,
  ): Promise<ExperienceAdmin> {
    const row = await requireAdminExperience(this.repo, experienceId);
    assertSameIds(
      row.photos.map((p) => p.id),
      items.map((i) => i.id),
      "photo",
    );
    if (coverId && !items.some((i) => i.id === coverId)) {
      throw new ValidationError("The cover must be one of the listing's photos.");
    }
    const byId = new Map(row.photos.map((p) => [p.id, p]));
    const next = items.map((i) => {
      const photo = byId.get(i.id)!;
      return { id: i.id, src: photo.src, alt: cleanAlt(i.alt, photo.alt) };
    });
    return applyPhotos(this.repo, this.media, experienceId, next, coverId);
  }
}
