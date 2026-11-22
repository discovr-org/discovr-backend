import { randomUUID } from "node:crypto";
import type { MessageLogRepository, MessageSend, NewMessageSend } from "../../application/ports/message-log-repository.js";

export class MemoryMessageLogRepository implements MessageLogRepository {
  private readonly rows: MessageSend[] = [];

  async add(row: NewMessageSend): Promise<MessageSend> {
    const saved = { ...row, id: randomUUID(), createdAt: new Date().toISOString() };
    this.rows.push(saved);
    return saved;
  }

  async userIdsAlreadySent(templateId: string, userIds: string[]): Promise<string[]> {
    const ids = new Set(userIds);
    return [...new Set(this.rows.filter((r) => r.templateId === templateId && r.status !== "FAILED" && ids.has(r.userId)).map((r) => r.userId))];
  }

  async listByBatch(batchId: string): Promise<MessageSend[]> {
    return this.rows.filter((r) => r.batchId === batchId);
  }

  async updateStatus(id: string, status: string, failedReason: string | null): Promise<void> {
    const row = this.rows.find((r) => r.id === id);
    if (row) Object.assign(row, { status, failedReason });
  }
}
