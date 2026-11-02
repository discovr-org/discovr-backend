import type {
  SaveRepository,
  UserSave,
} from "../../application/ports/save-repository.js";

export class MemorySaveRepository implements SaveRepository {
  /** userId → slug → createdAt */
  private readonly byUser = new Map<string, Map<string, string>>();

  async listByUserId(userId: string): Promise<UserSave[]> {
    const map = this.byUser.get(userId);
    if (!map) return [];
    return [...map.entries()]
      .map(([experienceSlug, createdAt]) => ({ experienceSlug, createdAt }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async replaceForUser(userId: string, slugs: string[]): Promise<UserSave[]> {
    const unique = [...new Set(slugs.map((s) => s.trim()).filter(Boolean))];
    const now = new Date().toISOString();
    const prev = this.byUser.get(userId) ?? new Map<string, string>();
    const next = new Map<string, string>();
    for (const slug of unique) {
      next.set(slug, prev.get(slug) ?? now);
    }
    this.byUser.set(userId, next);
    return this.listByUserId(userId);
  }

  async add(userId: string, experienceSlug: string): Promise<UserSave> {
    const slug = experienceSlug.trim();
    let map = this.byUser.get(userId);
    if (!map) {
      map = new Map();
      this.byUser.set(userId, map);
    }
    const existing = map.get(slug);
    if (existing) {
      return { experienceSlug: slug, createdAt: existing };
    }
    const createdAt = new Date().toISOString();
    map.set(slug, createdAt);
    return { experienceSlug: slug, createdAt };
  }

  async remove(userId: string, experienceSlug: string): Promise<void> {
    this.byUser.get(userId)?.delete(experienceSlug.trim());
  }
}
