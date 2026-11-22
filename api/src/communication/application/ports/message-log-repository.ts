export type MessageSend = {
  id: string;
  batchId: string;
  userId: string;
  phoneE164: string;
  templateId: string;
  /** BotSpace's message id. Null if it was refused before it got one. */
  providerMessageId: string | null;
  /** accepted | SENT | DELIVERED | READ | REPLIED | FAILED */
  status: string;
  failedReason: string | null;
  createdAt: string;
};

export type NewMessageSend = Omit<MessageSend, "id" | "createdAt">;

export interface MessageLogRepository {
  add(row: NewMessageSend): Promise<MessageSend>;
  /** Users who already have a message with this template that did not fail. */
  userIdsAlreadySent(templateId: string, userIds: string[]): Promise<string[]>;
  listByBatch(batchId: string): Promise<MessageSend[]>;
  updateStatus(id: string, status: string, failedReason: string | null): Promise<void>;
}
