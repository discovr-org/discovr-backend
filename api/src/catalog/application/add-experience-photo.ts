import type { ExperienceAdmin } from "../domain/experience.js";
import { applyPhotos, cleanAlt, requireAdminExperience } from "./experience-photos.js";
import { uploadImage, type ImageFile } from "./image-file.js";
import type { ExperienceMediaRepository } from "./ports/experience-media-repository.js";
import type { ExperienceRepository } from "./ports/experience-repository.js";
import type { ImageUploader } from "./ports/image-uploader.js";

/** Upload one carousel photo at the end. `makeCover` makes it the cover; otherwise the cover stays. */
export class AddExperiencePhoto {
  constructor(
    private readonly repo: ExperienceRepository,
    private readonly media: ExperienceMediaRepository,
    private readonly images: ImageUploader,
  ) {}

  async execute(input: {
    experienceId: string;
    file: ImageFile;
    alt?: string;
    makeCover?: boolean;
  }): Promise<ExperienceAdmin> {
    const existing = await requireAdminExperience(this.repo, input.experienceId);
    const uploaded = await uploadImage(this.images, input.file, {
      kind: "experience_photo",
      experienceId: input.experienceId,
    });
    await this.media.addPhoto(input.experienceId, {
      src: uploaded.url,
      alt: cleanAlt(input.alt, existing.title),
    });

    const row = await requireAdminExperience(this.repo, input.experienceId);
    const added = row.photos[row.photos.length - 1];
    if (!input.makeCover && row.photos.some((p) => p.isCover)) return row;
    const cover = input.makeCover
      ? added
      : (row.photos.find((p) => p.src === row.coverPhotoUrl) ?? row.photos[0]);
    return applyPhotos(this.repo, this.media, input.experienceId, row.photos, cover.id);
  }
}
