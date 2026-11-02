import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  SaveRepository,
  UserSave,
} from "../../application/ports/save-repository.js";

export class SupabaseSaveRepository implements SaveRepository {
  constructor(private readonly db: SupabaseClient) {}

  async listByUserId(userId: string): Promise<UserSave[]> {
    const { data, error } = await this.db
      .from("user_saves")
      .select("experience_slug, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapRow);
  }

  async replaceForUser(userId: string, slugs: string[]): Promise<UserSave[]> {
    const unique = [...new Set(slugs.map((s) => s.trim()).filter(Boolean))];

    const { error: delError } = await this.db
      .from("user_saves")
      .delete()
      .eq("user_id", userId);
    if (delError) throw delError;

    if (unique.length === 0) return [];

    const { data, error } = await this.db
      .from("user_saves")
      .insert(
        unique.map((experience_slug) => ({
          user_id: userId,
          experience_slug,
        })),
      )
      .select("experience_slug, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapRow);
  }

  async add(userId: string, experienceSlug: string): Promise<UserSave> {
    const slug = experienceSlug.trim();
    const { data, error } = await this.db
      .from("user_saves")
      .upsert(
        { user_id: userId, experience_slug: slug },
        { onConflict: "user_id,experience_slug" },
      )
      .select("experience_slug, created_at")
      .single();
    if (error) throw error;
    return mapRow(data);
  }

  async remove(userId: string, experienceSlug: string): Promise<void> {
    const { error } = await this.db
      .from("user_saves")
      .delete()
      .eq("user_id", userId)
      .eq("experience_slug", experienceSlug.trim());
    if (error) throw error;
  }
}

function mapRow(row: {
  experience_slug: string;
  created_at: string;
}): UserSave {
  return {
    experienceSlug: String(row.experience_slug),
    createdAt: String(row.created_at),
  };
}
