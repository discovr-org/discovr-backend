export type WelcomeJob = { id: string; userId: string; phoneE164: string; attempts: number };

export interface WelcomeJobRepository {
  /** One job per user; a second call for the same user does nothing. */
  enqueue(userId: string, phoneE164: string, runAt: Date): Promise<void>;
  /**
   * Takes up to `limit` due jobs for this worker only. Each taken job has attempts +1
   * and is pushed `retryInMs` ahead, so if the worker dies or the send fails it comes back.
   */
  claimDue(now: Date, limit: number, retryInMs: number): Promise<WelcomeJob[]>;
  finish(id: string, status: "done" | "failed"): Promise<void>;
  /** BotSpace took it. The job is done; its message id lets us check delivery later. */
  markSent(id: string, messageId: string, at: Date): Promise<void>;
  /** Sent jobs sent between `newerThan` and `olderThan` whose delivery is still unknown. */
  listAwaitingDelivery(olderThan: Date, newerThan: Date, limit: number): Promise<{ id: string; messageId: string }[]>;
  /** WhatsApp's final word. `error` is set when it was not delivered. */
  recordDelivery(id: string, status: string, error: string | null): Promise<void>;
  /** Why the latest try failed. */
  recordError(id: string, message: string): Promise<void>;
}
