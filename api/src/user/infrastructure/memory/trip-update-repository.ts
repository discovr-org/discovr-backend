import type { TripUpdateRepository } from "../../application/ports/trip-update-repository.js";

export class MemoryTripUpdateRepository implements TripUpdateRepository {
  private readonly phones = new Map<string, string | undefined>();

  async subscribe(phoneE164: string, source?: string): Promise<void> {
    if (!this.phones.has(phoneE164)) this.phones.set(phoneE164, source);
  }
}
