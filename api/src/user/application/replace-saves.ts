import { ValidationError } from "../../shared/errors.js";
import type { SaveRepository } from "./ports/save-repository.js";

const MAX_SAVES = 200;

export class ReplaceSaves {
  constructor(private readonly saves: SaveRepository) {}

  async execute(userId: string, slugs: string[]) {
    if (!Array.isArray(slugs)) {
      throw new ValidationError("Saves must be a list of slugs.");
    }
    if (slugs.length > MAX_SAVES) {
      throw new ValidationError(`You can save up to ${MAX_SAVES} places.`);
    }
    for (const slug of slugs) {
      if (typeof slug !== "string" || !slug.trim()) {
        throw new ValidationError("Each save needs a slug.");
      }
    }
    return this.saves.replaceForUser(userId, slugs);
  }
}
