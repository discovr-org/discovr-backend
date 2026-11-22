import type { User } from "../domain/user.js";
import type { UserRepository } from "./ports/user-repository.js";

export class FindOrCreateUser {
  constructor(private readonly users: UserRepository) {}

  async execute(phoneE164: string): Promise<{ user: User; created: boolean }> {
    const existing = await this.users.findByPhone(phoneE164);
    if (existing) return { user: existing, created: false };
    return { user: await this.users.create(phoneE164), created: true };
  }
}
