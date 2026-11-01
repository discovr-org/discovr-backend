import type { User } from "../domain/user.js";
import type { UserRepository } from "./ports/user-repository.js";

export class FindOrCreateUser {
  constructor(private readonly users: UserRepository) {}

  async execute(phoneE164: string): Promise<User> {
    const existing = await this.users.findByPhone(phoneE164);
    if (existing) return existing;
    return this.users.create(phoneE164);
  }
}
