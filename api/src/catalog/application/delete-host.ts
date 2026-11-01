import { NotFoundError, ValidationError } from "../domain/errors.js";
import type { ExperienceRepository } from "./ports/experience-repository.js";

export class DeleteHost {
  constructor(private readonly repo: ExperienceRepository) {}

  async execute(id: string): Promise<void> {
    const hosts = await this.repo.listHosts();
    const host = hosts.find((h) => h.id === id);
    if (!host) throw new NotFoundError(`Host ${id} not found`);
    if (host.experienceCount > 0) {
      throw new ValidationError(
        `This host still has ${host.experienceCount} listing${host.experienceCount === 1 ? "" : "s"}. Delete or move those first.`,
      );
    }
    await this.repo.deleteHost(id);
  }
}
