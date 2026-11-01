import { randomUUID } from "node:crypto";
import type { AuthSession } from "../../domain/otp.js";
import type {
  CreateSessionInput,
  SessionRepository,
} from "../../application/ports/session-repository.js";

export class MemorySessionRepository implements SessionRepository {
  private readonly rows: AuthSession[] = [];

  async create(input: CreateSessionInput): Promise<AuthSession> {
    const row: AuthSession = {
      id: randomUUID(),
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt.toISOString(),
      revokedAt: null,
      createdAt: new Date().toISOString(),
    };
    this.rows.push(row);
    return row;
  }

  async findByTokenHash(
    tokenHash: string,
    now: Date,
  ): Promise<AuthSession | null> {
    const nowMs = now.getTime();
    return (
      this.rows.find(
        (r) =>
          r.tokenHash === tokenHash &&
          !r.revokedAt &&
          new Date(r.expiresAt).getTime() > nowMs,
      ) ?? null
    );
  }

  async revoke(id: string, at: Date): Promise<void> {
    const row = this.rows.find((r) => r.id === id);
    if (row) row.revokedAt = at.toISOString();
  }
}
