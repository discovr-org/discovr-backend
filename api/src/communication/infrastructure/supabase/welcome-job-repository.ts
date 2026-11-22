import type { SupabaseClient } from "@supabase/supabase-js";
import type { WelcomeJob, WelcomeJobRepository } from "../../application/ports/welcome-job-repository.js";

export class SupabaseWelcomeJobRepository implements WelcomeJobRepository {
  constructor(private readonly db: SupabaseClient) {}

  async enqueue(userId: string, phoneE164: string, runAt: Date) {
    const { error } = await this.db
      .from("welcome_jobs")
      .upsert({ user_id: userId, phone_e164: phoneE164, run_at: runAt.toISOString() }, { onConflict: "user_id", ignoreDuplicates: true });
    if (error) throw error;
  }

  async claimDue(now: Date, limit: number, retryInMs: number): Promise<WelcomeJob[]> {
    const { data, error } = await this.db
      .from("welcome_jobs")
      .select("id, user_id, phone_e164, attempts, run_at")
      .eq("status", "pending")
      .lte("run_at", now.toISOString())
      .order("run_at")
      .limit(limit);
    if (error) throw error;
    const claimed: WelcomeJob[] = [];
    for (const r of data ?? []) {
      // Wins only if nobody else changed run_at first, so two API copies never both send.
      const { data: won, error: err } = await this.db
        .from("welcome_jobs")
        .update({ attempts: r.attempts + 1, run_at: new Date(now.getTime() + retryInMs).toISOString() })
        .eq("id", r.id)
        .eq("status", "pending")
        .eq("run_at", r.run_at)
        .select("id");
      if (err) throw err;
      if (won?.length) claimed.push({ id: String(r.id), userId: String(r.user_id), phoneE164: String(r.phone_e164), attempts: r.attempts + 1 });
    }
    return claimed;
  }

  async recordError(id: string, message: string) {
    const { error } = await this.db.from("welcome_jobs").update({ last_error: message }).eq("id", id);
    if (error) throw error;
  }

  async finish(id: string, status: "done" | "failed") {
    const { error } = await this.db.from("welcome_jobs").update({ status }).eq("id", id);
    if (error) throw error;
  }
}
