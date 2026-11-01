import { ValidationError } from "../../shared/errors.js";

/** Normalize Indian-friendly input to E.164. Default country +91. */
export function normalizePhoneE164(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) throw new ValidationError("Add a phone number.");

  if (trimmed.startsWith("+")) {
    const digits = trimmed.slice(1).replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) {
      throw new ValidationError("That phone number looks wrong.");
    }
    return `+${digits}`;
  }

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) {
    return `+91${digits.slice(1)}`;
  }
  throw new ValidationError("Use a 10-digit Indian number or +E.164.");
}
