import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExperienceRepository } from "../../application/ports/experience-repository.js";
import type {
  Experience,
  ExperienceAdmin,
  ExperienceContent,
  ExperienceCreate,
  ExperiencePatch,
  ExperienceStatus,
  ExperienceSummary,
  ListingCard,
  HostCreate,
  HostPatch,
  HostSummary,
  IncludedItem,
  Photo,
  Review,
  WeekSchedule,
} from "../../domain/experience.js";

/**
 * Supabase adapter. Maps relational rows → domain Experience / ListingCard.
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
    const host = row.host as { active?: boolean } | null;
    if (host && host.active === false) return null;
    return mapExperience(row);
  }

  async listCards(): Promise<ListingCard[]> {
    const { data, error } = await this.db
      .from("experiences")
      .select(
        `
        slug,
        title,
        place_neighborhood,
        price_from_inr,
        price_ask,
        cover_photo_url,
        cover_photo_alt,
        duration_minutes,
        about,
        verdict,
        host:hosts(active)
      `,
      )
      .eq("status", "published");
    if (error) throw error;
    return ((data ?? []) as DbRow[])
      .filter((row) => (row.host as { active?: boolean } | null)?.active !== false)
      .map(mapListingCard);
  }

  async listExperiences(): Promise<ExperienceSummary[]> {
    const { data, error } = await this.db
      .from("experiences")
      .select(
        `
        id,
        slug,
        title,
        status,
        verdict,
        price_from_inr,
        place_neighborhood,
        host_id,
        host:hosts(business_name, active)
      `,
      )
      .order("published_at", { ascending: false, nullsFirst: false });

    if (error) throw error;
    return (data ?? []).map((row) => {
      const host = row.host as {
        business_name?: string;
        active?: boolean;
      } | null;
      return {
        id: String(row.id),
        slug: String(row.slug),
        title: String(row.title),
        status: normalizeStatus(row.status),
        verdict: String(row.verdict ?? ""),
        priceFromInr: Number(row.price_from_inr ?? 0),
        hostId: String(row.host_id),
        hostBusinessName: String(host?.business_name ?? ""),
        hostActive: host?.active !== false,
        placeNeighborhood: String(row.place_neighborhood ?? ""),
      };
    });
  }

  async listHosts(): Promise<HostSummary[]> {
    const { data, error } = await this.db
      .from("hosts")
      .select(
        "id, business_name, person_name, phone_e164, experience_count, active, avatar_url, avatar_alt, credit",
      )
      .order("business_name", { ascending: true });

    if (error) throw error;

    const counts = new Map<string, number>();
    const { data: exps } = await this.db.from("experiences").select("host_id");
    for (const row of exps ?? []) {
      const id = String(row.host_id);
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }

    return (data ?? []).map((row) => ({
      id: String(row.id),
      businessName: String(row.business_name),
      personName: String(row.person_name),
      phone: String(row.phone_e164),
      experienceCount:
        row.experience_count != null
          ? Number(row.experience_count)
          : (counts.get(String(row.id)) ?? 0),
      active: row.active !== false,
      avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
      avatarAlt: row.avatar_alt ? String(row.avatar_alt) : undefined,
      credit: parseHostCredit(row.credit),
    }));
  }

  async createExperience(input: ExperienceCreate): Promise<ExperienceAdmin> {
    const payload = {
      title: input.title,
      slug: input.slug,
      host_id: input.hostId,
      status: input.status ?? "draft",
      verdict: input.verdict ?? null,
      about: input.about ?? "",
      place_name: input.placeName,
      place_neighborhood: input.placeNeighborhood,
      place_lat: input.placeLat,
      place_lng: input.placeLng,
      price_from_inr: input.priceFromInr ?? 0,
      duration_minutes: input.durationMinutes ?? 120,
      group_size_max: input.groupSizeMax ?? 8,
      group_size_label:
        input.groupSizeLabel ??
        "Come solo, as a couple, with friends or with family.",
      published_at:
        (input.status ?? "draft") === "published"
          ? new Date().toISOString()
          : null,
    };

    const { data, error } = await this.db
      .from("experiences")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") throw new Error("Slug already taken");
      throw error;
    }

    const created = await this.getAdminById(String(data.id));
    if (!created) throw new Error("Experience create failed");
    return created;
  }

  async createHost(input: HostCreate): Promise<HostSummary> {
    const credit = input.credit ?? "hosted";
    const { data, error } = await this.db
      .from("hosts")
      .insert({
        business_name: input.businessName,
        person_name: input.personName,
        phone_e164: input.phone,
        active: input.active ?? true,
        verified: false,
        languages: [],
        credit,
      })
      .select("id, business_name, person_name, phone_e164, active, credit")
      .single();

    if (error) throw error;

    return {
      id: String(data.id),
      businessName: String(data.business_name),
      personName: String(data.person_name),
      phone: String(data.phone_e164),
      experienceCount: 0,
      active: data.active !== false,
      credit: parseHostCredit(data.credit),
    };
  }

  async getAdminById(id: string): Promise<ExperienceAdmin | null> {
    const { data: row, error } = await this.db
      .from("experiences")
      .select(
        `
        id,
        slug,
        title,
        status,
        verdict,
        about,
        place_name,
        place_neighborhood,
        place_lat,
        place_lng,
        price_from_inr,
        duration_minutes,
        group_size_max,
        group_size_label,
        host_id,
        schedule,
        policy,
        content,
        cover_photo_url,
        cover_photo_alt,
        host:hosts(business_name),
        tags:experience_tags(tag)
      `,
      )
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!row) return null;
    return mapAdmin(row);
  }

  async updateExperience(
    id: string,
    patch: ExperiencePatch,
  ): Promise<ExperienceAdmin> {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (patch.title !== undefined) payload.title = patch.title.trim();
    if (patch.slug !== undefined) payload.slug = patch.slug.trim();
    if (patch.status !== undefined) {
      payload.status = patch.status;
      if (patch.status === "published") {
        payload.published_at = new Date().toISOString();
      }
    }
    if (patch.verdict !== undefined) {
      payload.verdict = patch.verdict?.trim() || null;
    }
    if (patch.about !== undefined) payload.about = patch.about;
    if (patch.placeName !== undefined) payload.place_name = patch.placeName.trim();
    if (patch.placeNeighborhood !== undefined) {
      payload.place_neighborhood = patch.placeNeighborhood.trim();
    }
    if (patch.placeLat !== undefined) payload.place_lat = patch.placeLat;
    if (patch.placeLng !== undefined) payload.place_lng = patch.placeLng;
    if (patch.priceFromInr !== undefined) {
      payload.price_from_inr = patch.priceFromInr;
    }
    if (patch.durationMinutes !== undefined) {
      payload.duration_minutes = patch.durationMinutes;
    }
    if (patch.groupSizeMax !== undefined) {
      payload.group_size_max = patch.groupSizeMax;
    }
    if (patch.groupSizeLabel !== undefined) {
      payload.group_size_label = patch.groupSizeLabel.trim();
    }
    if (patch.schedule !== undefined) payload.schedule = patch.schedule;
    if (patch.policy !== undefined) payload.policy = patch.policy;
    if (patch.content !== undefined) payload.content = patch.content;
    if (patch.coverPhotoUrl !== undefined) {
      payload.cover_photo_url = patch.coverPhotoUrl;
    }
    if (patch.coverPhotoAlt !== undefined) {
      payload.cover_photo_alt = patch.coverPhotoAlt;
    }

    const { error } = await this.db
      .from("experiences")
      .update(payload)
      .eq("id", id);

    if (error) {
      if (error.code === "23505") throw new Error("Slug already taken");
      throw error;
    }

    if (patch.coverPhotoUrl) {
      await this.db
        .from("experience_photos")
        .update({ is_cover: false })
        .eq("experience_id", id);
      await this.db.from("experience_photos").insert({
        experience_id: id,
        src: patch.coverPhotoUrl,
        alt: patch.coverPhotoAlt?.trim() || "Cover",
        sort_order: 0,
        is_cover: true,
      });
    }

    if (patch.tags !== undefined) {
      const { error: delErr } = await this.db
        .from("experience_tags")
        .delete()
        .eq("experience_id", id);
      if (delErr) throw delErr;
      if (patch.tags.length > 0) {
        const { error: tagErr } = await this.db.from("experience_tags").insert(
          patch.tags.map((tag) => ({ experience_id: id, tag })),
        );
        if (tagErr) throw tagErr;
      }
    }

    const updated = await this.getAdminById(id);
    if (!updated) throw new Error(`Experience ${id} not found`);
    return updated;
  }

  async deleteExperience(id: string): Promise<void> {
    const { data, error } = await this.db
      .from("experiences")
      .delete()
      .eq("id", id)
      .select("id");

    if (error) throw error;
    if (!data?.length) throw new Error(`Experience ${id} not found`);
  }

  async updateHost(id: string, patch: HostPatch): Promise<HostSummary> {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (patch.businessName !== undefined) {
      payload.business_name = patch.businessName.trim();
    }
    if (patch.personName !== undefined) {
      payload.person_name = patch.personName.trim();
    }
    if (patch.phone !== undefined) {
      payload.phone_e164 = patch.phone.trim();
    }
    if (patch.active !== undefined) payload.active = patch.active;
    if (patch.avatarUrl !== undefined) payload.avatar_url = patch.avatarUrl;
    if (patch.avatarAlt !== undefined) payload.avatar_alt = patch.avatarAlt;
    if (patch.credit !== undefined) payload.credit = patch.credit;

    const { error } = await this.db.from("hosts").update(payload).eq("id", id);
    if (error) throw error;

    const hosts = await this.listHosts();
    const host = hosts.find((h) => h.id === id);
    if (!host) throw new Error(`Host ${id} not found`);
    return host;
  }

  async deleteHost(id: string): Promise<void> {
    const { data, error } = await this.db
      .from("hosts")
      .delete()
      .eq("id", id)
      .select("id");

    if (error) {
      if (error.code === "23503") {
        throw new Error("Host still has listings");
      }
      throw error;
    }
    if (!data?.length) throw new Error(`Host ${id} not found`);
  }
}

function mapAdmin(row: DbRow): ExperienceAdmin {
  const host = row.host as { business_name?: string } | null;
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    status: normalizeStatus(row.status),
    verdict: String(row.verdict ?? ""),
    about: String(row.about ?? ""),
    placeName: String(row.place_name ?? ""),
    placeNeighborhood: String(row.place_neighborhood ?? ""),
    placeLat: Number(row.place_lat ?? 0),
    placeLng: Number(row.place_lng ?? 0),
    priceFromInr: Number(row.price_from_inr ?? 0),
    durationMinutes: Number(row.duration_minutes ?? 0),
    groupSizeMax: Number(row.group_size_max ?? 1),
    groupSizeLabel: String(row.group_size_label ?? ""),
    hostId: String(row.host_id),
    hostBusinessName: String(host?.business_name ?? ""),
    coverPhotoUrl: row.cover_photo_url
      ? String(row.cover_photo_url)
      : undefined,
    coverPhotoAlt: row.cover_photo_alt
      ? String(row.cover_photo_alt)
      : undefined,
    tags: ((row.tags as { tag: string }[]) ?? []).map((t) => t.tag),
    schedule: (row.schedule as ExperienceAdmin["schedule"]) ?? {},
    policy: (row.policy as ExperienceAdmin["policy"]) ?? null,
    content: (row.content as ExperienceAdmin["content"]) ?? {},
  };
}

function normalizeStatus(value: unknown): ExperienceStatus {
  if (value === "draft" || value === "archived") return value;
  return "published";
}

function parseHostCredit(value: unknown): "hosted" | "run" | "owned" {
  if (value === "run" || value === "owned" || value === "hosted") return value;
  return "hosted";
}

function parsePriceTaxes(value: unknown): "extra" | "inclusive" {
  if (value === "extra" || value === "inclusive") return value;
  return "inclusive";
}

type DbRow = Record<string, unknown>;

function mapExperience(row: DbRow): Experience {
  const host = row.host as DbRow;
  let photos = ((row.photos as DbRow[]) ?? [])
    .slice()
    .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
    .map(
      (p): Photo => ({
        src: String(p.src),
        alt: String(p.alt),
      }),
    );
  if (!photos.length && row.cover_photo_url) {
    photos = [
      {
        src: String(row.cover_photo_url),
        alt: String(row.cover_photo_alt ?? row.title ?? "Cover"),
      },
    ];
  }

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
      credit: parseHostCredit(host.credit),
    },
    photos,
    verdict: String(row.verdict ?? ""),
    price: {
      fromAmount: Number(row.price_from_inr),
      paidTo: String(row.price_paid_to),
      askForPrice: Boolean(row.price_ask) || undefined,
      taxes: parsePriceTaxes(
        (row.content as ExperienceContent | null | undefined)?.taxes,
      ),
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
    content: (row.content as ExperienceContent | null) ?? undefined,
  };
}

function mapListingCard(row: DbRow): ListingCard {
  const minutes = Number(row.duration_minutes);
  return {
    slug: String(row.slug),
    title: String(row.title),
    placeLabel: String(row.place_neighborhood ?? ""),
    imageSrc: row.cover_photo_url ? String(row.cover_photo_url) : undefined,
    imageAlt: row.cover_photo_alt ? String(row.cover_photo_alt) : undefined,
    priceInr: row.price_ask ? undefined : Number(row.price_from_inr),
    priceAsk: Boolean(row.price_ask) || undefined,
    blurb: String(row.verdict || row.about || "") || undefined,
    durationMinutes: minutes > 0 ? minutes : undefined,
  };
}
