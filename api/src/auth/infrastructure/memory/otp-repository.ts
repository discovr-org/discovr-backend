import { randomUUID } from "node:crypto";
import type { AuthOtp } from "../../domain/otp.js";
import type {
  CreateOtpInput,
  OtpRepository,
} from "../../application/ports/otp-repository.js";

export class MemoryOtpRepository implements OtpRepository {
  private readonly rows: AuthOtp[] = [];

  async create(input: CreateOtpInput): Promise<AuthOtp> {
    const row: AuthOtp = {
      id: randomUUID(),
      phoneE164: input.phoneE164,
      codeHash: input.codeHash,
      expiresAt: input.expiresAt.toISOString(),
      attempts: 0,
      consumedAt: null,
      createdAt: new Date().toISOString(),
    };
    this.rows.push(row);
    return row;
  }

  async findLatestActive(
    phoneE164: string,
    now: Date,
  ): Promise<AuthOtp | null> {
    const nowMs = now.getTime();
    const matches = this.rows
      .filter(
        (r) =>
          r.phoneE164 === phoneE164 &&
          !r.consumedAt &&
          new Date(r.expiresAt).getTime() > nowMs,
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    return matches[0] ?? null;
  }

  async incrementAttempts(id: string): Promise<void> {
    const row = this.rows.find((r) => r.id === id);
    if (row) row.attempts += 1;
  }

  async markConsumed(id: string, at: Date): Promise<void> {
    const row = this.rows.find((r) => r.id === id);
    if (row) row.consumedAt = at.toISOString();
  }
}
