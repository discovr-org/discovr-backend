import type { CreateHandoffInput, HandoffRepository } from "../../application/ports/handoff-repository.js";

export class MemoryHandoffRepository implements HandoffRepository {
  private readonly rows = new Map<string, { userId: string; expiresAt: number; used: boolean }>();

  async create(input: CreateHandoffInput): Promise<void> {
    this.rows.set(input.codeHash, { userId: input.userId, expiresAt: input.expiresAt.getTime(), used: false });
  }

  async consume(codeHash: string, now: Date): Promise<{ userId: string } | null> {
    const row = this.rows.get(codeHash);
    if (!row || row.used || row.expiresAt <= now.getTime()) return null;
    row.used = true;
    return { userId: row.userId };
  }
}
