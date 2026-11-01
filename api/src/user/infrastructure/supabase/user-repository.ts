import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "../../domain/user.js";
import type { UserRepository } from "../../application/ports/user-repository.js";

export class SupabaseUserRepository implements UserRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findByPhone(phoneE164: string): Promise<User | null> {
    const { data, error } = await this.db
      .from("users")
      .select("id, phone_e164, created_at")
      .eq("phone_e164", phoneE164)
      .maybeSingle();
    if (error) throw error;
    return data ? mapUser(data) : null;
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.db
      .from("users")
      .select("id, phone_e164, created_at")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapUser(data) : null;
  }

  async create(phoneE164: string): Promise<User> {
    const { data, error } = await this.db
      .from("users")
      .insert({ phone_e164: phoneE164 })
      .select("id, phone_e164, created_at")
      .single();
    if (error) throw error;
    return mapUser(data);
  }
}

function mapUser(row: {
  id: string;
  phone_e164: string;
  created_at: string;
}): User {
  return {
    id: String(row.id),
    phoneE164: String(row.phone_e164),
    createdAt: String(row.created_at),
  };
}
