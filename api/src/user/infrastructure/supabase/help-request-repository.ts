import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  HelpRequest,
  HelpRequestRepository,
} from "../../application/ports/help-request-repository.js";

export class SupabaseHelpRequestRepository implements HelpRequestRepository {
  constructor(private readonly db: SupabaseClient) {}

  async add(request: HelpRequest): Promise<void> {
    const { error } = await this.db.from("help_requests").insert({
      category: request.category,
      message: request.message,
      name: request.name,
      phone_e164: request.phoneE164,
    });
    if (error) throw error;
  }
}
