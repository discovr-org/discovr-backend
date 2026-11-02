import { normalizePhoneE164 } from "../../shared/phone.js";
import type { TripUpdateRepository } from "./ports/trip-update-repository.js";

export class SubscribeTripUpdates {
  constructor(private readonly signups: TripUpdateRepository) {}

  async execute(rawPhone: string, source?: string) {
    const phone = normalizePhoneE164(String(rawPhone ?? ""));
    await this.signups.subscribe(phone, source?.trim().slice(0, 120) || undefined);
    return { ok: true as const };
  }
}
