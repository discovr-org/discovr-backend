import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "../../domain/user.js";
import type { UserRepository } from "../../application/ports/user-repository.js";

const COLUMNS = "id, phone_e164, name, created_at";

export class SupabaseUserRepository implements UserRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findByPhone(phoneE164: string): Promise<User | null> {
    const { data, error } = await this.db
      .from("users")
      .select(COLUMNS)
      .eq("phone_e164", phoneE164)
      .maybeSingle();
    if (error) throw error;
    return data ? mapUser(data) : null;
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.db
      .from("users")
      .select(COLUMNS)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapUser(data) : null;
  }

  async create(phoneE164: string): Promise<User> {
    const { data, error } = await this.db
      .from("users")
      .insert({ phone_e164: phoneE164 })
      .select(COLUMNS)
      .single();
    if (error) throw error;
    return mapUser(data);
  }

  async updateName(id: string, name: string): Promise<User | null> {
    const { data, error } = await this.db
      .from("users")
      .update({ name, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(COLUMNS)
      .maybeSingle();
    if (error) throw error;
    return data ? mapUser(data) : null;
  }
}

function mapUser(row: {
  id: string;
  phone_e164: string;
  name: string | null;
  created_at: string;
}): User {
  return {
    id: String(row.id),
    phoneE164: String(row.phone_e164),
    name: row.name ? String(row.name) : null,
    createdAt: String(row.created_at),
  };
}
