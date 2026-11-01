import { NotFoundError, ValidationError } from "../domain/errors.js";
import type { ExperienceAdmin } from "../domain/experience.js";
import type { ExperienceRepository } from "./ports/experience-repository.js";
import type { ImageUploader } from "./ports/image-uploader.js";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export class UploadExperienceCover {
  constructor(
    private readonly repo: ExperienceRepository,
    private readonly images: ImageUploader,
  ) {}

  async execute(input: {
    experienceId: string;
    bytes: Buffer;
    filename: string;
    contentType: string;
    alt?: string;
  }): Promise<ExperienceAdmin> {
    if (!ALLOWED.has(input.contentType)) {
      throw new ValidationError("Use a JPG, PNG, WebP, or GIF.");
    }
    if (input.bytes.byteLength === 0) {
      throw new ValidationError("Empty file.");
    }
    if (input.bytes.byteLength > 10 * 1024 * 1024) {
      throw new ValidationError("Image must be under 10MB.");
    }

    const existing = await this.repo.getAdminById(input.experienceId);
    if (!existing) {
      throw new NotFoundError(`Experience ${input.experienceId} not found`);
    }

    const uploaded = await this.images.upload({
      bytes: input.bytes,
      filename: input.filename,
      contentType: input.contentType,
      metadata: {
        kind: "experience_cover",
        experienceId: input.experienceId,
      },
    });

    const alt = input.alt?.trim() || existing.title;
    return this.repo.updateExperience(input.experienceId, {
      coverPhotoUrl: uploaded.url,
      coverPhotoAlt: alt,
    });
  }
}
