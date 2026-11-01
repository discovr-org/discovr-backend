import type { User } from "../../domain/user.js";

export interface UserRepository {
  findByPhone(phoneE164: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(phoneE164: string): Promise<User>;
}
