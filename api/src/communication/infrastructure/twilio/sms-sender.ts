import { ValidationError } from "../../../shared/errors.js";
import type { SmsSender } from "../../application/ports/sms-sender.js";

type TwilioConfig = {
  accountSid: string;
  authToken: string;
  fromNumber: string;
};

/**
 * Twilio Messages API adapter.
 * From number must be a Twilio-owned or verified sender.
 */
export class TwilioSmsSender implements SmsSender {
  constructor(private readonly config: TwilioConfig) {}

  async send(input: { toE164: string; body: string }): Promise<void> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}/Messages.json`;
    const auth = Buffer.from(
      `${this.config.accountSid}:${this.config.authToken}`,
    ).toString("base64");

    const form = new URLSearchParams();
    form.set("To", input.toE164);
    form.set("From", this.config.fromNumber);
    form.set("Body", input.body);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
    });

    if (!res.ok) {
      let detail = `Twilio SMS failed (${res.status})`;
      try {
        const body = (await res.json()) as { message?: string };
        if (body.message) detail = body.message;
      } catch {
        /* keep default */
      }
      throw new ValidationError(detail);
    }
  }
}
