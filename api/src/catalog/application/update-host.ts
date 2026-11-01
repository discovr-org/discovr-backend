import { NotFoundError, ValidationError } from "../domain/errors.js";
import type { HostPatch, HostSummary } from "../domain/experience.js";
import type { ExperienceRepository } from "./ports/experience-repository.js";

export class UpdateHost {
  constructor(private readonly repo: ExperienceRepository) {}

  async execute(id: string, patch: HostPatch): Promise<HostSummary> {
    if (Object.keys(patch).length === 0) {
      throw new ValidationError("Nothing to update.");
    }
    if (patch.businessName !== undefined && !patch.businessName.trim()) {
      throw new ValidationError("Business name can't be empty.");
    }
    if (patch.personName !== undefined && !patch.personName.trim()) {
      throw new ValidationError("Contact name can't be empty.");
    }
    if (patch.phone !== undefined && !patch.phone.trim()) {
      throw new ValidationError("Phone can't be empty.");
    }
    try {
      return await this.repo.updateHost(id, patch);
    } catch (err) {
      if (err instanceof Error && err.message.includes("not found")) {
        throw new NotFoundError(`Host ${id} not found`);
      }
      throw err;
    }
  }
}
