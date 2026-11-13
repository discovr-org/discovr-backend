import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateHandoffInput, HandoffRepository } from "../../application/ports/handoff-repository.js";

export class SupabaseHandoffRepository implements HandoffRepository {
  constructor(private readonly db: SupabaseClient) {}

  async create(input: CreateHandoffInput): Promise<void> {
    const { error } = await this.db.from("auth_handoffs").insert({
      user_id: input.userId,
      code_hash: input.codeHash,
      expires_at: input.expiresAt.toISOString(),
    });
    if (error) throw error;
  }

  async consume(codeHash: string, now: Date): Promise<{ userId: string } | null> {
    // One UPDATE that only matches an unused, unexpired code: two requests can't both win.
    const { data, error } = await this.db
      .from("auth_handoffs")
      .update({ consumed_at: now.toISOString() })
      .eq("code_hash", codeHash)
      .is("consumed_at", null)
      .gt("expires_at", now.toISOString())
      .select("user_id")
      .maybeSingle();
    if (error) throw error;
    return data ? { userId: String(data.user_id) } : null;
  }
}
