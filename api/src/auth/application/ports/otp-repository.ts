import type { AuthOtp } from "../../domain/otp.js";

export type CreateOtpInput = {
  phoneE164: string;
  codeHash: string;
  expiresAt: Date;
};

export interface OtpRepository {
  create(input: CreateOtpInput): Promise<AuthOtp>;
  findLatestActive(phoneE164: string, now: Date): Promise<AuthOtp | null>;
  incrementAttempts(id: string): Promise<void>;
  markConsumed(id: string, at: Date): Promise<void>;
}
