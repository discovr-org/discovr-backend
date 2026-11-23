import type { WelcomeJobRepository } from "./ports/welcome-job-repository.js";
import type { WhatsAppSender } from "./ports/whatsapp-sender.js";

const DELAY_MS = 2 * 60 * 1000; // time to type a name
const RETRY_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 4; // first try + 3 retries
const CHECK_AFTER_MS = 60 * 1000;
const GIVE_UP_MS = 60 * 60 * 1000;
const MIN_GAP_MS = 20 * 1000; // app opens can be many; check the table at most this often

export class WelcomeQueue {
  private busy = false;
  private lastRun = 0;

  constructor(
    private readonly jobs: WelcomeJobRepository,
    private readonly sender: WhatsAppSender,
    private readonly templateId: string,
  ) {}

  enqueue(userId: string, phoneE164: string) {
    return this.jobs.enqueue(userId, phoneE164, new Date(Date.now() + DELAY_MS));
  }

  /** A minute after sending, ask WhatsApp what happened. A refusal goes in last_error; the job stays "done". */
  private async checkDelivery() {
    const now = Date.now();
    const sent = await this.jobs.listAwaitingDelivery(new Date(now - CHECK_AFTER_MS), new Date(now - GIVE_UP_MS), 20);
    for (const j of sent) {
      const s = await this.sender.deliveryStatus(j.messageId).catch(() => null); // not ready yet: try next time
      if (!s || s.status === "SENT") continue;
      await this.jobs.recordDelivery(j.id, s.status, s.status === "FAILED" ? (s.failedReason ?? "WhatsApp did not deliver it.") : null);
    }
  }

  /** Sends every due welcome. `nameOf` gives the first name, or null. Cheap to call often. */
  async tick(nameOf: (userId: string) => Promise<string | null>) {
    if (this.busy || Date.now() - this.lastRun < MIN_GAP_MS) return;
    this.busy = true;
    this.lastRun = Date.now();
    try {
      for (const job of await this.jobs.claimDue(new Date(), 20, RETRY_MS)) {
        const name = (await nameOf(job.userId).catch(() => null)) || "there";
        try {
          const { messageId } = await this.sender.sendTemplate({ toE164: job.phoneE164, name, templateId: this.templateId, variables: [name] });
          await this.jobs.markSent(job.id, messageId, new Date());
        } catch (err) {
          const reason = err instanceof Error ? err.message : "Couldn't send.";
          console.warn(`Welcome WhatsApp failed (try ${job.attempts}):`, reason);
          await this.jobs.recordError(job.id, reason).catch(() => {});
          if (job.attempts >= MAX_ATTEMPTS) {
            await this.jobs.finish(job.id, "failed");
          }
        }
      }
      await this.checkDelivery();
    } catch (err) {
      console.warn("Welcome queue tick failed:", err instanceof Error ? err.message : err);
    } finally {
      this.busy = false;
    }
  }
}
