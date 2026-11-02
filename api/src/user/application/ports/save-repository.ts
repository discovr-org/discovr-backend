export type UserSave = {
  experienceSlug: string;
  createdAt: string;
};

export interface SaveRepository {
  listByUserId(userId: string): Promise<UserSave[]>;
  /** Replace the full set for a user (guest localStorage sync). */
  replaceForUser(userId: string, slugs: string[]): Promise<UserSave[]>;
  add(userId: string, experienceSlug: string): Promise<UserSave>;
  remove(userId: string, experienceSlug: string): Promise<void>;
}
