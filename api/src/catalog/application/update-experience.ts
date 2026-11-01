import { NotFoundError, ValidationError } from "../domain/errors.js";
import type {
  ExperienceAdmin,
  ExperiencePatch,
  ExperienceStatus,
} from "../domain/experience.js";
import type { ExperienceRepository } from "./ports/experience-repository.js";

const STATUSES = new Set<ExperienceStatus>(["draft", "published", "archived"]);

export class UpdateExperience {
  constructor(private readonly repo: ExperienceRepository) {}

  async execute(id: string, patch: ExperiencePatch): Promise<ExperienceAdmin> {
    if (Object.keys(patch).length === 0) {
      throw new ValidationError("Nothing to update.");
    }
    if (patch.status && !STATUSES.has(patch.status)) {
      throw new ValidationError("Status must be draft, published, or archived.");
    }
    if (patch.title !== undefined && !patch.title.trim()) {
      throw new ValidationError("Title can't be empty.");
    }
    if (patch.slug !== undefined && !patch.slug.trim()) {
      throw new ValidationError("Slug can't be empty.");
    }
    if (patch.priceFromInr !== undefined && patch.priceFromInr < 0) {
      throw new ValidationError("Price can't be negative.");
    }
    if (patch.durationMinutes !== undefined && patch.durationMinutes <= 0) {
      throw new ValidationError("Duration must be positive.");
    }

    const existing = await this.repo.getAdminById(id);
    if (!existing) throw new NotFoundError(`Experience ${id} not found`);

    const nextStatus = patch.status ?? existing.status;
    const nextVerdict =
      patch.verdict !== undefined ? patch.verdict : existing.verdict;
    if (
      nextStatus === "published" &&
      (!nextVerdict || !String(nextVerdict).trim())
    ) {
      throw new ValidationError("Published listings need a one-line verdict.");
    }

    return this.repo.updateExperience(id, patch);
  }
}
