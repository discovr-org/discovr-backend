import { randomUUID } from "node:crypto";
import type { WelcomeJob, WelcomeJobRepository } from "../../application/ports/welcome-job-repository.js";

type Row = WelcomeJob & { runAt: number; status: string; lastError?: string; messageId?: string; sentAt?: number; delivery?: string };

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

  async markSent(id: string, messageId: string, at: Date) {
    const r = this.rows.find((x) => x.id === id);
    if (r) Object.assign(r, { status: "done", messageId, sentAt: at.getTime() });
  }

  async listAwaitingDelivery(olderThan: Date, newerThan: Date, limit: number) {
    return this.rows
      .filter((r) => r.messageId && !r.delivery && r.sentAt! <= olderThan.getTime() && r.sentAt! >= newerThan.getTime())
      .slice(0, limit)
      .map((r) => ({ id: r.id, messageId: r.messageId! }));
  }

  async recordDelivery(id: string, status: string, error: string | null) {
    const r = this.rows.find((x) => x.id === id);
    if (r) Object.assign(r, { delivery: status, lastError: error ?? r.lastError });
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
