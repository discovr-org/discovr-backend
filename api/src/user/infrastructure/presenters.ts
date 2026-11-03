import type { UserSave } from "../application/ports/save-repository.js";
import type { User } from "../domain/user.js";

export function presentUser(user: User) {
  return {
    id: user.id,
    phone: user.phoneE164,
    name: user.name,
    createdAt: user.createdAt,
  };
}

export type PresentedUser = ReturnType<typeof presentUser>;

export function presentSave(row: UserSave) {
  return {
    slug: row.experienceSlug,
    createdAt: row.createdAt,
  };
}
