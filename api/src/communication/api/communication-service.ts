import { SendSms } from "../application/send-sms.js";
import type { SmsSender } from "../application/ports/sms-sender.js";

/** Public door into communication. Other modules call only this. */
export class CommunicationService {
  private readonly sendSms: SendSms;

  constructor(sms: SmsSender) {
    this.sendSms = new SendSms(sms);
  }

  async sendSmsMessage(input: { toE164: string; body: string }) {
    await this.sendSms.execute(input);
  }
}
