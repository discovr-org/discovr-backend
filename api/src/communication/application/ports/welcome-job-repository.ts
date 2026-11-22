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
  /** Why the latest try failed. */
  recordError(id: string, message: string): Promise<void>;
}
