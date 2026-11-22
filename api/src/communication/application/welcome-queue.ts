import { randomUUID } from "node:crypto";
import type { MessageLogRepository } from "./ports/message-log-repository.js";
import type { WelcomeJobRepository } from "./ports/welcome-job-repository.js";
import type { WhatsAppSender } from "./ports/whatsapp-sender.js";

const DELAY_MS = 2 * 60 * 1000; // time to type a name
const RETRY_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 4; // first try + 3 retries
const EVERY_MS = 30 * 1000;

export class WelcomeQueue {
  private busy = false;

  constructor(
    private readonly jobs: WelcomeJobRepository,
    private readonly sender: WhatsAppSender,
    private readonly log: MessageLogRepository,
    private readonly templateId: string,
  ) {}

  enqueue(userId: string, phoneE164: string) {
    return this.jobs.enqueue(userId, phoneE164, new Date(Date.now() + DELAY_MS));
  }

  /** Checks for due jobs every 30 s. `nameOf` gives the first name, or null. */
  start(nameOf: (userId: string) => Promise<string | null>) {
    setInterval(() => void this.tick(nameOf), EVERY_MS).unref();
  }

  async tick(nameOf: (userId: string) => Promise<string | null>) {
    if (this.busy) return;
    this.busy = true;
    try {
      for (const job of await this.jobs.claimDue(new Date(), 20, RETRY_MS)) {
        const name = (await nameOf(job.userId).catch(() => null)) || "there";
        const batchId = randomUUID();
        try {
          const { messageId } = await this.sender.sendTemplate({ toE164: job.phoneE164, name, templateId: this.templateId, variables: [name] });
          await this.log.add({ batchId, userId: job.userId, phoneE164: job.phoneE164, templateId: this.templateId, providerMessageId: messageId, status: "accepted", failedReason: null });
          await this.jobs.finish(job.id, "done");
        } catch (err) {
          const reason = err instanceof Error ? err.message : "Couldn't send.";
          console.warn(`Welcome WhatsApp failed (try ${job.attempts}):`, reason);
          if (job.attempts >= MAX_ATTEMPTS) {
            await this.log.add({ batchId, userId: job.userId, phoneE164: job.phoneE164, templateId: this.templateId, providerMessageId: null, status: "FAILED", failedReason: reason }).catch(() => {});
            await this.jobs.finish(job.id, "failed");
          }
        }
      }
    } catch (err) {
      console.warn("Welcome queue tick failed:", err instanceof Error ? err.message : err);
    } finally {
      this.busy = false;
    }
  }
}
