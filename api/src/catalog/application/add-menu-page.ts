import type { ExperienceAdmin } from "../domain/experience.js";
import { cleanAlt, requireAdminExperience } from "./experience-photos.js";
import { uploadImage, type ImageFile } from "./image-file.js";
import type { ExperienceMediaRepository } from "./ports/experience-media-repository.js";
import type { ExperienceRepository } from "./ports/experience-repository.js";
import type { ImageUploader } from "./ports/image-uploader.js";

/** Upload one menu page image, added at the end. */
export class AddMenuPage {
  constructor(
    private readonly repo: ExperienceRepository,
    private readonly media: ExperienceMediaRepository,
    private readonly images: ImageUploader,
  ) {}

  async execute(input: {
    experienceId: string;
    file: ImageFile;
    label?: string;
    alt?: string;
  }): Promise<ExperienceAdmin> {
    const existing = await requireAdminExperience(this.repo, input.experienceId);
    const uploaded = await uploadImage(this.images, input.file, {
      kind: "experience_menu_page",
      experienceId: input.experienceId,
    });
    const label = cleanAlt(input.label, `Page ${existing.menuPages.length + 1}`);
    await this.media.addMenuPage(input.experienceId, {
      src: uploaded.url,
      label,
      alt: cleanAlt(input.alt, `${existing.title} menu, ${label}`),
    });
    return requireAdminExperience(this.repo, input.experienceId);
  }
}
