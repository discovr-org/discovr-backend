export interface TripUpdateRepository {
  /** Idempotent: the same number twice is one signup. */
  subscribe(phoneE164: string, source?: string): Promise<void>;
}
