import type { UserService } from "../../user/api/user-service.js";
import type { PresentedUser } from "../../user/infrastructure/presenters.js";
import { ValidationError } from "../../shared/errors.js";
import {
  generateSessionToken,
  hashSecret,
  secretsMatch,
} from "./crypto.js";
import { normalizePhoneE164 } from "../../shared/phone.js";
import type { OtpRepository } from "./ports/otp-repository.js";
import type { SessionRepository } from "./ports/session-repository.js";

const MAX_ATTEMPTS = 5;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export class VerifyOtp {
  constructor(
    private readonly otps: OtpRepository,
    private readonly sessions: SessionRepository,
    private readonly users: UserService,
  ) {}

  async execute(input: {
    phone: string;
    code: string;
  }): Promise<{ sessionId: string; user: PresentedUser; isNewUser: boolean }> {
    const phone = normalizePhoneE164(input.phone);
    const code = input.code.trim();
    if (!/^\d{6}$/.test(code)) {
      throw new ValidationError("Enter the 6-digit code.");
    }

    const now = new Date();
    const otp = await this.otps.findLatestActive(phone, now);
    if (!otp) {
      throw new ValidationError("Code expired or missing. Request a new one.");
    }
    if (otp.attempts >= MAX_ATTEMPTS) {
      throw new ValidationError("Too many tries. Request a new code.");
    }

    if (!secretsMatch(code, otp.codeHash)) {
      await this.otps.incrementAttempts(otp.id);
      throw new ValidationError("Wrong code.");
    }

    await this.otps.markConsumed(otp.id, now);
    const user = await this.users.findOrCreateByPhone(phone);
    const sessionId = generateSessionToken();
    await this.sessions.create({
      userId: user.id,
      tokenHash: hashSecret(sessionId),
      expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
    });

    // No name yet means sign-up never finished, so the sheet asks for it again.
    return { sessionId, user, isNewUser: !user.name };
  }
}
