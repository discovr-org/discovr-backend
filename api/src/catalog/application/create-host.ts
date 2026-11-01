import { ValidationError } from "../domain/errors.js";
import type { HostCreate, HostSummary } from "../domain/experience.js";
import type { ExperienceRepository } from "./ports/experience-repository.js";

export class CreateHost {
  constructor(private readonly repo: ExperienceRepository) {}

  async execute(input: HostCreate): Promise<HostSummary> {
    if (!input.businessName?.trim()) {
      throw new ValidationError("Business name can't be empty.");
    }
    if (!input.personName?.trim()) {
      throw new ValidationError("Contact name can't be empty.");
    }
    if (!input.phone?.trim()) {
      throw new ValidationError("Phone can't be empty.");
    }
    return this.repo.createHost({
      businessName: input.businessName.trim(),
      personName: input.personName.trim(),
      phone: input.phone.trim(),
      active: input.active ?? true,
    });
  }
}
