import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthOtp } from "../../domain/otp.js";
import type {
  CreateOtpInput,
  OtpRepository,
} from "../../application/ports/otp-repository.js";

export class SupabaseOtpRepository implements OtpRepository {
  constructor(private readonly db: SupabaseClient) {}

  async create(input: CreateOtpInput): Promise<AuthOtp> {
    const { data, error } = await this.db
      .from("auth_otps")
      .insert({
        phone_e164: input.phoneE164,
        code_hash: input.codeHash,
        expires_at: input.expiresAt.toISOString(),
      })
      .select(
        "id, phone_e164, code_hash, expires_at, attempts, consumed_at, created_at",
      )
      .single();
    if (error) throw error;
    return mapOtp(data);
  }

  async findLatestActive(
    phoneE164: string,
    now: Date,
  ): Promise<AuthOtp | null> {
    const { data, error } = await this.db
      .from("auth_otps")
      .select(
        "id, phone_e164, code_hash, expires_at, attempts, consumed_at, created_at",
      )
      .eq("phone_e164", phoneE164)
      .is("consumed_at", null)
      .gt("expires_at", now.toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? mapOtp(data) : null;
  }

  async incrementAttempts(id: string): Promise<void> {
    const { data, error } = await this.db
      .from("auth_otps")
      .select("attempts")
      .eq("id", id)
      .single();
    if (error) throw error;
    const next = Number(data.attempts ?? 0) + 1;
    const { error: updateError } = await this.db
      .from("auth_otps")
      .update({ attempts: next })
      .eq("id", id);
    if (updateError) throw updateError;
  }

  async markConsumed(id: string, at: Date): Promise<void> {
    const { error } = await this.db
      .from("auth_otps")
      .update({ consumed_at: at.toISOString() })
      .eq("id", id);
    if (error) throw error;
  }
}

function mapOtp(row: {
  id: string;
  phone_e164: string;
  code_hash: string;
  expires_at: string;
  attempts: number;
  consumed_at: string | null;
  created_at: string;
}): AuthOtp {
  return {
    id: String(row.id),
    phoneE164: String(row.phone_e164),
    codeHash: String(row.code_hash),
    expiresAt: String(row.expires_at),
    attempts: Number(row.attempts ?? 0),
    consumedAt: row.consumed_at ? String(row.consumed_at) : null,
    createdAt: String(row.created_at),
  };
}
