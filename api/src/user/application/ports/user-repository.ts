import type { Trip, User } from "../../domain/user.js";

export interface UserRepository {
  findByPhone(phoneE164: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(phoneE164: string): Promise<User>;
  /** Null when the user does not exist. */
  updateName(id: string, name: string): Promise<User | null>;
  /** Null when the user does not exist. */
  updateTrip(id: string, trip: Trip): Promise<User | null>;
}
