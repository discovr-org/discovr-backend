import type { SaveRepository } from "./ports/save-repository.js";

export class ListSaves {
  constructor(private readonly saves: SaveRepository) {}

  execute(userId: string) {
    return this.saves.listByUserId(userId);
  }
}
