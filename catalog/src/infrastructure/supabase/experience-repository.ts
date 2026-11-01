import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExperienceRepository } from "../../application/ports/experience-repository.js";
import type {
  Experience,
  FeedCard,
  FeedSection,
  IncludedItem,
  Photo,
  Review,
  WeekSchedule,
} from "../../domain/experience.js";

/**
 * Supabase adapter. Maps relational rows → domain Experience / FeedSection.
 * Keep SQL shape changes here — use-cases stay untouched.
 */
export class SupabaseExperienceRepository implements ExperienceRepository {
  constructor(private readonly db: SupabaseClient) {}

  async getBySlug(slug: string): Promise<Experience | null> {
    const { data: row, error } = await this.db
      .from("experiences")
      .select(
        `
        *,
        host:hosts(*),
        photos:experience_photos(*),
        inclusions:experience_inclusions(*),
        menu_pages:experience_menu_pages(*),
        tags:experience_tags(tag),
        reviews:reviews(*)
      `,
      )
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) throw error;
    if (!row) return null;
    return mapExperience(row);
  }

  async listFeed(): Promise<FeedSection[]> {
    const { data, error } = await this.db
      .from("feed_sections")
      .select(
        `
        id,
        slug,
        title,
        density,
        sort_order,
        items:feed_section_items(
          sort_order,
          card_title_override,
          card_place_override,
          experience:experiences(
            slug,
            title,
            place_neighborhood,
            price_from_inr,
            price_ask,
            cover_photo_url,
            cover_photo_alt,
            duration_minutes,
            about,
            status
          )
        )
      `,
      )
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return (data ?? []).map(mapFeedSection).filter((s) => s.items.length > 0);
  }
}

type DbRow = Record<string, unknown>;

function mapExperience(row: DbRow): Experience {
  const host = row.host as DbRow;
  const photos = ((row.photos as DbRow[]) ?? [])
    .slice()
    .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
    .map(
      (p): Photo => ({
        src: String(p.src),
        alt: String(p.alt),
      }),
    );

  const inclusions = ((row.inclusions as DbRow[]) ?? [])
    .slice()
    .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
    .map(
      (i): IncludedItem => ({
        included: Boolean(i.included),
        title: String(i.title),
        detail: i.detail ? String(i.detail) : undefined,
        detailTone: i.detail_tone === "positive" ? "positive" : undefined,
      }),
    );

  const menuPages = ((row.menu_pages as DbRow[]) ?? [])
    .slice()
    .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
    .map((p) => ({
      src: String(p.src),
      label: String(p.label),
      alt: String(p.alt),
    }));

  const reviewRows = ((row.reviews as DbRow[]) ?? [])
    .filter((r) => r.published !== false)
    .slice()
    .sort(
      (a, b) =>
        new Date(String(b.created_at)).getTime() -
        new Date(String(a.created_at)).getTime(),
    );

  const count = Number(row.rating_count ?? 0);
  const reviews =
    count > 0
      ? {
          average: Number(row.rating_avg),
          count,
          distribution: [
            Number(row.rating_bucket_5 ?? 0),
            Number(row.rating_bucket_4 ?? 0),
            Number(row.rating_bucket_3 ?? 0),
            Number(row.rating_bucket_2 ?? 0),
            Number(row.rating_bucket_1 ?? 0),
          ] as [number, number, number, number, number],
          items: reviewRows.slice(0, 2).map(
            (r): Review => ({
              id: String(r.id),
              name: String(r.reviewer_first_name),
              context: String(r.context),
              score: Number(r.score),
              body: String(r.body),
              avatarSrc: r.avatar_url ? String(r.avatar_url) : undefined,
            }),
          ),
        }
      : undefined;

  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    host: {
      businessName: String(host.business_name),
      personName: String(host.person_name),
      phone: String(host.phone_e164),
      instagramHandle: host.instagram_handle
        ? String(host.instagram_handle)
        : undefined,
      avatar: host.avatar_url
        ? {
            src: String(host.avatar_url),
            alt: String(host.avatar_alt ?? host.person_name),
          }
        : undefined,
      verified: Boolean(host.verified),
      experienceCount:
        host.experience_count != null ? Number(host.experience_count) : undefined,
      languages: (host.languages as string[]) ?? [],
    },
    photos,
    verdict: String(row.verdict ?? ""),
    price: {
      fromAmount: Number(row.price_from_inr),
      paidTo: String(row.price_paid_to),
      askForPrice: Boolean(row.price_ask) || undefined,
    },
    place: {
      name: String(row.place_name),
      neighborhood: String(row.place_neighborhood),
      lat: Number(row.place_lat),
      lng: Number(row.place_lng),
    },
    schedule: (row.schedule as WeekSchedule) ?? {},
    durationMinutes: Number(row.duration_minutes),
    groupSizeLabel: String(row.group_size_label),
    about: String(row.about),
    included: inclusions,
    menu: menuPages.length ? { pages: menuPages } : undefined,
    policy: (row.policy as Experience["policy"]) ?? undefined,
    reviews,
    tags: ((row.tags as { tag: string }[]) ?? []).map((t) => t.tag),
  };
}

function mapFeedSection(row: DbRow): FeedSection {
  const items = ((row.items as DbRow[]) ?? [])
    .slice()
    .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
    .map((item): FeedCard | null => {
      const exp = item.experience as DbRow | null;
      if (!exp || exp.status !== "published") return null;
      const minutes = Number(exp.duration_minutes);
      const card: FeedCard = {
        slug: String(exp.slug),
        title: String(item.card_title_override ?? exp.title),
        placeLabel: String(item.card_place_override ?? exp.place_neighborhood),
        imageSrc: String(exp.cover_photo_url ?? ""),
        imageAlt: String(exp.cover_photo_alt ?? exp.title),
        priceInr: exp.price_ask ? undefined : Number(exp.price_from_inr),
        priceAsk: Boolean(exp.price_ask) || undefined,
      };
      if (row.density === "landscape") {
        card.blurb = String(exp.about).slice(0, 160);
        card.durationLabel = formatMinutes(minutes);
      }
      return card;
    })
    .filter((x): x is FeedCard => x != null && Boolean(x.imageSrc));

  return {
    id: String(row.slug ?? row.id),
    title: String(row.title),
    density: row.density === "landscape" ? "landscape" : "portrait",
    items,
  };
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  if (Number.isInteger(hours)) return hours === 1 ? "1 hour" : `${hours} hours`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h} hour${h === 1 ? "" : "s"} ${m} min`;
}
