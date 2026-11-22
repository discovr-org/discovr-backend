import type { Trip, User } from "../../domain/user.js";

/** Who ops want to reach. Days are India-time "YYYY-MM-DD". */
export type UserFilter = {
  signedUpFrom?: string;
  signedUpTo?: string;
  /** Their last day in Goa is today or within this many days. */
  leavingWithinDays?: number;
};

export interface UserRepository {
  /** Newest sign-ups first, at most `limit`. */
  list(filter: UserFilter, limit: number): Promise<User[]>;
  findByIds(ids: string[]): Promise<User[]>;
  findByPhone(phoneE164: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(phoneE164: string): Promise<User>;
  /** Null when the user does not exist. */
  updateName(id: string, name: string): Promise<User | null>;
  /** Null when the user does not exist. */
  updateTrip(id: string, trip: Trip): Promise<User | null>;
}
