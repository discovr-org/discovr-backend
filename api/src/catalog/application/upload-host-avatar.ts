import { NotFoundError, ValidationError } from "../domain/errors.js";
import type { HostSummary } from "../domain/experience.js";
import type { ExperienceRepository } from "./ports/experience-repository.js";
import type { ImageUploader } from "./ports/image-uploader.js";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export class UploadHostAvatar {
  constructor(
    private readonly repo: ExperienceRepository,
    private readonly images: ImageUploader,
  ) {}

  async execute(input: {
    hostId: string;
    bytes: Buffer;
    filename: string;
    contentType: string;
    alt?: string;
  }): Promise<HostSummary> {
    if (!ALLOWED.has(input.contentType)) {
      throw new ValidationError("Use a JPG, PNG, WebP, or GIF.");
    }
    if (input.bytes.byteLength === 0) {
      throw new ValidationError("Empty file.");
    }
    if (input.bytes.byteLength > 10 * 1024 * 1024) {
      throw new ValidationError("Image must be under 10MB.");
    }

    const hosts = await this.repo.listHosts();
    const existing = hosts.find((h) => h.id === input.hostId);
    if (!existing) {
      throw new NotFoundError(`Host ${input.hostId} not found`);
    }

    const uploaded = await this.images.upload({
      bytes: input.bytes,
      filename: input.filename,
      contentType: input.contentType,
      metadata: {
        kind: "host_avatar",
        hostId: input.hostId,
      },
    });

    const alt = input.alt?.trim() || existing.personName || existing.businessName;
    return this.repo.updateHost(input.hostId, {
      avatarUrl: uploaded.url,
      avatarAlt: alt,
    });
  }
}
