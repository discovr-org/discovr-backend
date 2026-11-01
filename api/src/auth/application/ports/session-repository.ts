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
}
