import type { AuthSession } from "../../domain/otp.js";

export type CreateSessionInput = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
};

export interface SessionRepository {
  create(input: CreateSessionInput): Promise<AuthSession>;
  findByTokenHash(tokenHash: string, now: Date): Promise<AuthSession | null>;
  revoke(id: string, at: Date): Promise<void>;
  /** One round trip: revoke whichever live session has this token. No-op if none. */
  revokeByTokenHash(tokenHash: string, at: Date): Promise<void>;
}
