import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthSession } from "../../domain/otp.js";
import type {
  CreateSessionInput,
  SessionRepository,
} from "../../application/ports/session-repository.js";

export class SupabaseSessionRepository implements SessionRepository {
  constructor(private readonly db: SupabaseClient) {}

  async create(input: CreateSessionInput): Promise<AuthSession> {
    const { data, error } = await this.db
      .from("auth_sessions")
      .insert({
        user_id: input.userId,
        token_hash: input.tokenHash,
        expires_at: input.expiresAt.toISOString(),
      })
      .select(
        "id, user_id, token_hash, expires_at, revoked_at, created_at",
      )
      .single();
    if (error) throw error;
    return mapSession(data);
  }

  async findByTokenHash(
    tokenHash: string,
    now: Date,
  ): Promise<AuthSession | null> {
    const { data, error } = await this.db
      .from("auth_sessions")
      .select(
        "id, user_id, token_hash, expires_at, revoked_at, created_at",
      )
      .eq("token_hash", tokenHash)
      .is("revoked_at", null)
      .gt("expires_at", now.toISOString())
      .maybeSingle();
    if (error) throw error;
    return data ? mapSession(data) : null;
  }

  async revoke(id: string, at: Date): Promise<void> {
    const { error } = await this.db
      .from("auth_sessions")
      .update({ revoked_at: at.toISOString() })
      .eq("id", id);
    if (error) throw error;
  }
}

function mapSession(row: {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  revoked_at: string | null;
  created_at: string;
}): AuthSession {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    tokenHash: String(row.token_hash),
    expiresAt: String(row.expires_at),
    revokedAt: row.revoked_at ? String(row.revoked_at) : null,
    createdAt: String(row.created_at),
  };
}
