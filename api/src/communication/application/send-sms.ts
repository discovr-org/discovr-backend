import { ValidationError } from "../../shared/errors.js";
import type { SmsSender } from "./ports/sms-sender.js";

export class SendSms {
  constructor(private readonly sms: SmsSender) {}

  async execute(input: { toE164: string; body: string }): Promise<void> {
    const to = input.toE164.trim();
    const body = input.body.trim();
    if (!to.startsWith("+") || to.length < 8) {
      throw new ValidationError("Phone must be E.164 (+…).");
    }
    if (!body) {
      throw new ValidationError("SMS body can't be empty.");
    }
    await this.sms.send({ toE164: to, body });
  }
}
