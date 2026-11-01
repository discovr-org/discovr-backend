import type { FeedSection } from "../domain/experience.js";
import type { ExperienceRepository } from "./ports/experience-repository.js";

export class ListFeed {
  constructor(private readonly repo: ExperienceRepository) {}

  execute(): Promise<FeedSection[]> {
    return this.repo.listFeed();
  }
}
