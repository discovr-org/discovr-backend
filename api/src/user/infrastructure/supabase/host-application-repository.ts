import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  HostApplication,
  HostApplicationRepository,
} from "../../application/ports/host-application-repository.js";

export class SupabaseHostApplicationRepository implements HostApplicationRepository {
  constructor(private readonly db: SupabaseClient) {}

  async add(application: HostApplication): Promise<void> {
    const { error } = await this.db.from("host_applications").insert({
      name: application.name,
      phone_e164: application.phoneE164,
      city: application.city,
      description: application.description,
    });
    if (error) throw error;
  }
}
