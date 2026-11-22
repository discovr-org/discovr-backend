import { randomUUID } from "node:crypto";
import type { WelcomeJob, WelcomeJobRepository } from "../../application/ports/welcome-job-repository.js";

type Row = WelcomeJob & { runAt: number; status: string; lastError?: string };

export class MemoryWelcomeJobRepository implements WelcomeJobRepository {
  private readonly rows: Row[] = [];

  async enqueue(userId: string, phoneE164: string, runAt: Date) {
    if (this.rows.some((r) => r.userId === userId)) return;
    this.rows.push({ id: randomUUID(), userId, phoneE164, attempts: 0, runAt: runAt.getTime(), status: "pending" });
  }

  async claimDue(now: Date, limit: number, retryInMs: number) {
    const due = this.rows.filter((r) => r.status === "pending" && r.runAt <= now.getTime()).slice(0, limit);
    for (const r of due) {
      r.attempts += 1;
      r.runAt = now.getTime() + retryInMs;
    }
    return due.map(({ id, userId, phoneE164, attempts }) => ({ id, userId, phoneE164, attempts }));
  }

  async recordError(id: string, message: string) {
    const r = this.rows.find((x) => x.id === id);
    if (r) r.lastError = message;
  }

  async finish(id: string, status: "done" | "failed") {
    const r = this.rows.find((x) => x.id === id);
    if (r) r.status = status;
  }
}
