import { RefreshBatch, SendTemplateBatch, type Recipient } from "../application/send-template-batch.js";
import type { MessageLogRepository } from "../application/ports/message-log-repository.js";
import type { WhatsAppSender } from "../application/ports/whatsapp-sender.js";
import { WelcomeQueue } from "../application/welcome-queue.js";
import type { WelcomeJobRepository } from "../application/ports/welcome-job-repository.js";
import { TEMPLATES } from "../domain/templates.js";
import { SendSms } from "../application/send-sms.js";
import type { SmsSender } from "../application/ports/sms-sender.js";

/** Public door into communication. Other modules call only this. */
export class CommunicationService {
  private readonly sendSms: SendSms;
  private readonly sendBatch: SendTemplateBatch;
  private readonly refreshBatch: RefreshBatch;
  private readonly welcome: WelcomeQueue | null;

  constructor(
    sms: SmsSender,
    private readonly whatsapp: WhatsAppSender,
    private readonly log: MessageLogRepository,
    jobs: WelcomeJobRepository,
    welcomeTemplateId?: string,
  ) {
    this.welcome = welcomeTemplateId ? new WelcomeQueue(jobs, whatsapp, welcomeTemplateId) : null;
    this.sendSms = new SendSms(sms);
    this.sendBatch = new SendTemplateBatch(whatsapp, log);
    this.refreshBatch = new RefreshBatch(whatsapp, log);
  }

  /** WhatsApp templates ops can send. */
  templates() {
    return TEMPLATES;
  }

  /** Which of these people already got this template (and it didn't fail). */
  alreadySent(templateId: string, userIds: string[]) {
    return this.log.userIdsAlreadySent(templateId, userIds);
  }

  sendTemplateBatch(input: { templateId: string; recipients: Recipient[]; allowRepeat?: boolean }) {
    return this.sendBatch.execute(input);
  }

  /** A batch's messages, optionally after asking BotSpace for fresh delivery status. */
  batchMessages(batchId: string, refresh: boolean) {
    return refresh ? this.refreshBatch.execute(batchId) : this.log.listByBatch(batchId);
  }

  /** Queue a welcome WhatsApp for a brand-new user. No-op until a welcome template is set. */
  async queueWelcome(userId: string, phoneE164: string) {
    await this.welcome?.enqueue(userId, phoneE164);
  }

  /** Send any welcomes that are due. `nameOf` gives a user's first name, or null. */
  async runWelcomeJobs(nameOf: (userId: string) => Promise<string | null>) {
    await this.welcome?.tick(nameOf);
  }

  async sendSmsMessage(input: { toE164: string; body: string }) {
    await this.sendSms.execute(input);
  }
}
