import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExperienceMediaRepository } from "../../application/ports/experience-media-repository.js";

/** Supabase adapter for `experience_photos` and `experience_menu_pages`. */
export class SupabaseExperienceMediaRepository implements ExperienceMediaRepository {
  constructor(private readonly db: SupabaseClient) {}

  async addPhoto(experienceId: string, photo: { src: string; alt: string }) {
    const { error } = await this.db.from("experience_photos").insert({
      experience_id: experienceId,
      src: photo.src,
      alt: photo.alt,
      sort_order: await this.nextSortOrder("experience_photos", experienceId),
      is_cover: false,
    });
    if (error) throw error;
  }

  async setPhotos(
    experienceId: string,
    items: Array<{ id: string; alt: string }>,
    coverId: string | null,
  ) {
    await Promise.all(
      items.map(async (item, index) => {
        const { error } = await this.db
          .from("experience_photos")
          .update({ alt: item.alt, sort_order: index, is_cover: item.id === coverId })
          .eq("experience_id", experienceId)
          .eq("id", item.id);
        if (error) throw error;
      }),
    );
  }

  async deletePhoto(experienceId: string, photoId: string) {
    const { error } = await this.db
      .from("experience_photos")
      .delete()
      .eq("experience_id", experienceId)
      .eq("id", photoId);
    if (error) throw error;
  }

  async addMenuPage(
    experienceId: string,
    page: { src: string; label: string; alt: string },
  ) {
    const { error } = await this.db.from("experience_menu_pages").insert({
      experience_id: experienceId,
      ...page,
      sort_order: await this.nextSortOrder("experience_menu_pages", experienceId),
    });
    if (error) throw error;
  }

  async setMenuPages(
    experienceId: string,
    items: Array<{ id: string; label: string; alt: string }>,
  ) {
    await Promise.all(
      items.map(async (item, index) => {
        const { error } = await this.db
          .from("experience_menu_pages")
          .update({ label: item.label, alt: item.alt, sort_order: index })
          .eq("experience_id", experienceId)
          .eq("id", item.id);
        if (error) throw error;
      }),
    );
  }

  async deleteMenuPage(experienceId: string, pageId: string) {
    const { error } = await this.db
      .from("experience_menu_pages")
      .delete()
      .eq("experience_id", experienceId)
      .eq("id", pageId);
    if (error) throw error;
  }

  private async nextSortOrder(
    table: "experience_photos" | "experience_menu_pages",
    experienceId: string,
  ): Promise<number> {
    const { data, error } = await this.db
      .from(table)
      .select("sort_order")
      .eq("experience_id", experienceId)
      .order("sort_order", { ascending: false })
      .limit(1);
    if (error) throw error;
    const last = data?.[0]?.sort_order;
    return typeof last === "number" ? last + 1 : 0;
  }
}
