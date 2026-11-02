import { ValidationError } from "../../shared/errors.js";
import type { SaveRepository } from "./ports/save-repository.js";

export class AddSave {
  constructor(private readonly saves: SaveRepository) {}

  async execute(userId: string, experienceSlug: string) {
    if (typeof experienceSlug !== "string" || !experienceSlug.trim()) {
      throw new ValidationError("Add a listing slug to save.");
    }
    return this.saves.add(userId, experienceSlug);
  }
}
