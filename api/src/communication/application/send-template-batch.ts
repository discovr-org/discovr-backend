import { randomUUID } from "node:crypto";
import { ValidationError } from "../../shared/errors.js";
import { TEMPLATES, variablesFor } from "../domain/templates.js";
import type { MessageLogRepository } from "./ports/message-log-repository.js";
import type { WhatsAppSender } from "./ports/whatsapp-sender.js";

const MAX_BATCH = 200;
const AT_ONCE = 4;

export type Recipient = { userId: string; name: string | null; phone: string; values: Record<string, string> };
export type SendResult = { userId: string; result: "accepted" | "skipped" | "failed"; reason?: string };

export class SendTemplateBatch {
  constructor(private readonly sender: WhatsAppSender, private readonly log: MessageLogRepository) {}

  async execute(input: { templateId: string; recipients: Recipient[]; allowRepeat?: boolean }) {
    const template = TEMPLATES.find((t) => t.id === input.templateId);
    if (!template) throw new ValidationError("Pick one of the templates.");
    const recipients = input.recipients;
    if (!recipients.length) throw new ValidationError("Pick at least one person.");
    if (recipients.length > MAX_BATCH) throw new ValidationError(`Send to ${MAX_BATCH} people or fewer at a time.`);

    const batchId = randomUUID();
    const done = input.allowRepeat ? new Set<string>() : new Set(await this.log.userIdsAlreadySent(template.id, recipients.map((r) => r.userId)));
    const results: SendResult[] = [];

    const sendOne = async (r: Recipient) => {
      if (done.has(r.userId)) return results.push({ userId: r.userId, result: "skipped", reason: "Already got this template." });
      try {
        const { messageId } = await this.sender.sendTemplate({
          toE164: r.phone,
          name: r.name ?? "",
          templateId: template.id,
          variables: variablesFor(template, r.values),
          mediaUrl: template.mediaUrl,
        });
        await this.log.add({ batchId, userId: r.userId, phoneE164: r.phone, templateId: template.id, providerMessageId: messageId, status: "accepted", failedReason: null });
        results.push({ userId: r.userId, result: "accepted" });
      } catch (err) {
        const reason = err instanceof Error ? err.message : "Couldn't send.";
        await this.log.add({ batchId, userId: r.userId, phoneE164: r.phone, templateId: template.id, providerMessageId: null, status: "FAILED", failedReason: reason }).catch(() => {});
        results.push({ userId: r.userId, result: "failed", reason });
      }
    };

    // A few at a time: fast enough for a few hundred, gentle on BotSpace.
    const queue = [...recipients];
    await Promise.all(Array.from({ length: Math.min(AT_ONCE, queue.length) }, async () => {
      for (let r = queue.shift(); r; r = queue.shift()) await sendOne(r);
    }));
    return { batchId, results };
  }
}

/** Ask BotSpace how each message of a batch is doing and keep the log in step. */
export class RefreshBatch {
  constructor(private readonly sender: WhatsAppSender, private readonly log: MessageLogRepository) {}

  async execute(batchId: string) {
    const rows = await this.log.listByBatch(batchId);
    const open = rows.filter((r) => r.providerMessageId && !["READ", "REPLIED", "FAILED"].includes(r.status));
    await Promise.all(open.map(async (r) => {
      try {
        const s = await this.sender.deliveryStatus(r.providerMessageId!);
        if (s.status !== r.status) await this.log.updateStatus(r.id, s.status, s.failedReason ?? null);
      } catch {
        // Leave the old status; the next refresh tries again.
      }
    }));
    return this.log.listByBatch(batchId);
  }
}
