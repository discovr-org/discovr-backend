import { ValidationError } from "../../../shared/errors.js";
import type { DeliveryStatus, SendTemplateInput, WhatsAppSender } from "../../application/ports/whatsapp-sender.js";

const BASE = "https://public-api.bot.space";

/** BotSpace public API. The key travels in the query string (their design), so it is scrubbed from every error. */
export class BotspaceWhatsAppSender implements WhatsAppSender {
  constructor(private readonly apiKey: string, private readonly channelId: string) {}

  async sendTemplate(input: SendTemplateInput): Promise<{ messageId: string }> {
    const body = {
      phone: input.toE164,
      name: input.name,
      templateId: input.templateId,
      variables: input.variables,
      ...(input.mediaUrl ? { mediaVariable: input.mediaUrl } : {}),
    };
    const data = await this.call("POST", `/v1/${this.channelId}/message/send-message`, body);
    const id = (data.data ?? data).id;
    if (typeof id !== "string") throw new Error("BotSpace didn't return a message id.");
    return { messageId: id };
  }

  async deliveryStatus(messageId: string): Promise<DeliveryStatus> {
    const data = await this.call("GET", `/v1/${this.channelId}/message/${encodeURIComponent(messageId)}/delivery-status`);
    const d = (data.data ?? data) as { status: DeliveryStatus["status"]; failedReason?: string };
    return { status: d.status, failedReason: d.failedReason };
  }

  private async call(method: "GET" | "POST", path: string, body?: unknown): Promise<Record<string, any>> {
    let res: Response;
    try {
      res = await fetch(`${BASE}${path}?apiKey=${encodeURIComponent(this.apiKey)}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(20_000),
      });
    } catch (err) {
      throw new Error(this.scrub(err instanceof Error ? err.message : "BotSpace didn't answer."));
    }
    const json = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    if (!res.ok) {
      const msg = typeof json?.message === "string" ? json.message : Array.isArray(json?.message) ? json.message.join(", ") : `BotSpace said ${res.status}.`;
      throw new Error(this.scrub(msg));
    }
    return json ?? {};
  }

  private scrub(text: string): string {
    return text.split(this.apiKey).join("***");
  }
}

/** Used when the BotSpace keys aren't set, so the admin shows a clear reason instead of failing quietly. */
export class UnconfiguredWhatsAppSender implements WhatsAppSender {
  async sendTemplate(): Promise<never> {
    throw new ValidationError("WhatsApp isn't set up. Add BOTSPACE_API_KEY and BOTSPACE_CHANNEL_ID.");
  }
  async deliveryStatus(): Promise<never> {
    throw new ValidationError("WhatsApp isn't set up. Add BOTSPACE_API_KEY and BOTSPACE_CHANNEL_ID.");
  }
}
