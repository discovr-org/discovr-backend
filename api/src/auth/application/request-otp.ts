import type { CommunicationService } from "../../communication/api/communication-service.js";
import { ValidationError } from "../../shared/errors.js";
import { generateOtpCode, hashSecret } from "./crypto.js";
import { normalizePhoneE164 } from "./phone.js";
import type { OtpRepository } from "./ports/otp-repository.js";

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

export class RequestOtp {
  constructor(
    private readonly otps: OtpRepository,
    private readonly communication: CommunicationService,
  ) {}

  async execute(input: { phone: string }): Promise<{ ok: true; phone: string }> {
    const phone = normalizePhoneE164(input.phone);
    const now = new Date();

    const latest = await this.otps.findLatestActive(phone, now);
    if (latest) {
      const created = new Date(latest.createdAt).getTime();
      if (now.getTime() - created < RESEND_COOLDOWN_MS) {
        throw new ValidationError("Wait a minute before requesting another code.");
      }
    }

    const code = generateOtpCode();
    await this.otps.create({
      phoneE164: phone,
      codeHash: hashSecret(code),
      expiresAt: new Date(now.getTime() + OTP_TTL_MS),
    });

    await this.communication.sendSmsMessage({
      toE164: phone,
      body: `${code} is your discovr code. It works for 10 minutes. Do not share it with anyone.`,
    });

    return { ok: true, phone };
  }
}
