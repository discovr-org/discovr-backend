import type { User } from "../domain/user.js";

export function presentUser(user: User) {
  return {
    id: user.id,
    phone: user.phoneE164,
    createdAt: user.createdAt,
  };
}

export type PresentedUser = ReturnType<typeof presentUser>;
