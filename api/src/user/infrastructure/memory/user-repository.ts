import { randomUUID } from "node:crypto";
import type { Trip, User } from "../../domain/user.js";
import { addDays, startOfDayIst, todayIst } from "../../../shared/ist.js";
import type { UserFilter, UserRepository } from "../../application/ports/user-repository.js";

export class MemoryUserRepository implements UserRepository {
  private readonly byId = new Map<string, User>();
  private readonly byPhone = new Map<string, string>();

  async list(filter: UserFilter, limit: number): Promise<User[]> {
    const today = todayIst();
    return [...this.byId.values()]
      .filter((u) => {
        const made = Date.parse(u.createdAt);
        if (filter.signedUpFrom && made < Date.parse(startOfDayIst(filter.signedUpFrom))) return false;
        if (filter.signedUpTo && made >= Date.parse(startOfDayIst(addDays(filter.signedUpTo, 1)))) return false;
        if (filter.leavingWithinDays !== undefined) {
          const t = u.trip;
          if (t?.status !== "date" || !t.lastDay) return false;
          if (t.lastDay < today || t.lastDay > addDays(today, filter.leavingWithinDays)) return false;
        }
        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  async findByIds(ids: string[]): Promise<User[]> {
    return ids.flatMap((id) => this.byId.get(id) ?? []);
  }

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
      trip: null,
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

  async updateTrip(id: string, trip: Trip): Promise<User | null> {
    const user = this.byId.get(id);
    if (!user) return null;
    const next = { ...user, trip };
    this.byId.set(id, next);
    return next;
  }
}
