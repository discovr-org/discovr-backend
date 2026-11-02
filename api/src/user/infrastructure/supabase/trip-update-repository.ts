import type { SupabaseClient } from "@supabase/supabase-js";
import type { TripUpdateRepository } from "../../application/ports/trip-update-repository.js";

export class SupabaseTripUpdateRepository implements TripUpdateRepository {
  constructor(private readonly db: SupabaseClient) {}

  async subscribe(phoneE164: string, source?: string): Promise<void> {
    const { error } = await this.db
      .from("trip_update_signups")
      .upsert(
        { phone_e164: phoneE164, source: source ?? null },
        { onConflict: "phone_e164", ignoreDuplicates: true },
      );
    if (error) throw error;
  }
}
