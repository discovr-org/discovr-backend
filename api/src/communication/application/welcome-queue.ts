import type { WelcomeJobRepository } from "./ports/welcome-job-repository.js";
import type { WhatsAppSender } from "./ports/whatsapp-sender.js";

const DELAY_MS = 2 * 60 * 1000; // time to type a name
const RETRY_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 4; // first try + 3 retries
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

  /** Sends every due welcome. `nameOf` gives the first name, or null. Cheap to call often. */
  async tick(nameOf: (userId: string) => Promise<string | null>) {
    if (this.busy || Date.now() - this.lastRun < MIN_GAP_MS) return;
    this.busy = true;
    this.lastRun = Date.now();
    try {
      for (const job of await this.jobs.claimDue(new Date(), 20, RETRY_MS)) {
        const name = (await nameOf(job.userId).catch(() => null)) || "there";
        try {
          await this.sender.sendTemplate({ toE164: job.phoneE164, name, templateId: this.templateId, variables: [name] });
          await this.jobs.finish(job.id, "done");
        } catch (err) {
          const reason = err instanceof Error ? err.message : "Couldn't send.";
          console.warn(`Welcome WhatsApp failed (try ${job.attempts}):`, reason);
          await this.jobs.recordError(job.id, reason).catch(() => {});
          if (job.attempts >= MAX_ATTEMPTS) {
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
