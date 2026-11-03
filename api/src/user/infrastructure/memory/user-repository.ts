import { randomUUID } from "node:crypto";
import type { User } from "../../domain/user.js";
import type { UserRepository } from "../../application/ports/user-repository.js";

export class MemoryUserRepository implements UserRepository {
  private readonly byId = new Map<string, User>();
  private readonly byPhone = new Map<string, string>();

  async findByPhone(phoneE164: string): Promise<User | null> {
    const id = this.byPhone.get(phoneE164);
    return id ? (this.byId.get(id) ?? null) : null;
  }

  async findById(id: string): Promise<User | null> {
    return this.byId.get(id) ?? null;
  }

  async create(phoneE164: string): Promise<User> {
    const existing = await this.findByPhone(phoneE164);
    if (existing) return existing;
    const user: User = {
      id: randomUUID(),
      phoneE164,
      name: null,
      createdAt: new Date().toISOString(),
    };
    this.byId.set(user.id, user);
    this.byPhone.set(phoneE164, user.id);
    return user;
  }

  async updateName(id: string, name: string): Promise<User | null> {
    const user = this.byId.get(id);
    if (!user) return null;
    const next = { ...user, name };
    this.byId.set(id, next);
    return next;
  }
}
