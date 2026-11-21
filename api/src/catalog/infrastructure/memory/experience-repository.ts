import type { ExperienceMediaRepository } from "../../application/ports/experience-media-repository.js";
import type { ExperienceRepository } from "../../application/ports/experience-repository.js";
import { ValidationError } from "../../../shared/errors.js";
import type {
  Category,
  HomeSection,
  SiteSettings,
  CategoryInput,
  CategoryLayout,
  Experience,
  ExperienceAdmin,
  ExperienceCreate,
  ExperiencePatch,
  ExperienceStatus,
  ExperienceSummary,
  ListingCard,
  HostCreate,
  HostPatch,
  HostSummary,
  MenuPage,
  Photo,
} from "../../domain/experience.js";
import { seedExperiences } from "./seed.js";

function hostKey(businessName: string, phone: string) {
  return `${businessName}|${phone}`;
}

type MemoryHost = {
  id: string;
  businessName: string;
  personName: string;
  phone: string;
  active: boolean;
  avatarUrl?: string;
  avatarAlt?: string;
  credit: "hosted" | "run" | "owned";
};

function reorder<T>(
  rows: T[],
  items: Array<{ id: string }>,
  idOf: (row: T) => string,
): T[] {
  const byId = new Map(rows.map((r) => [idOf(r), r]));
  return items.map((i) => byId.get(i.id)).filter((r): r is T => r !== undefined);
}

export class MemoryExperienceRepository
  implements ExperienceRepository, ExperienceMediaRepository
{
  private readonly mediaIds = new WeakMap<object, string>();
  private readonly coverIds = new Map<string, string>();
  private readonly statuses = new Map<string, ExperienceStatus>();
  private readonly categories = new Map<string, Category>();
  private readonly categoryOf = new Map<string, string>();
  private readonly groupSizeMax = new Map<string, number>();
  private readonly covers = new Map<string, { url: string; alt: string }>();
  private readonly hosts = new Map<string, MemoryHost>();
  private readonly experienceHostId = new Map<string, string>();

  constructor(
    private readonly experiences: Experience[] = structuredClone(seedExperiences),
  ) {
    for (const e of this.experiences) {
      this.statuses.set(e.id, "published");
      this.groupSizeMax.set(e.id, 6);
      if (!e.host) continue; // no host: nothing to link
      const id = hostKey(e.host.businessName, e.host.phone);
      if (!this.hosts.has(id)) {
        this.hosts.set(id, {
          id,
          businessName: e.host.businessName,
          personName: e.host.personName,
          phone: e.host.phone,
          active: true,
          credit: e.host.credit ?? "hosted",
        });
      }
      this.experienceHostId.set(e.id, id);
    }
  }

  async getBySlug(slug: string): Promise<Experience | null> {
    const e = this.experiences.find((x) => x.slug === slug);
    if (!e) return null;
    if ((this.statuses.get(e.id) ?? "published") !== "published") return null;
    const hostId = this.experienceHostId.get(e.id);
    const host = hostId ? this.hosts.get(hostId) : undefined;
    if (host && !host.active) return null;
    return this.withCategory(e, this.categoryOf.get(e.id) ?? null);
  }

  private withCategory(e: Experience, categoryId: string | null, layout?: CategoryLayout): Experience {
    const c = categoryId ? this.categories.get(categoryId) : undefined;
    return c ? { ...e, category: { slug: c.slug, name: c.name, layout: layout ?? c.layout } } : e;
  }

  // ponytail: memory mode previews only the text fields and content; Supabase applies every field.
  // ponytail: memory mode previews only the text fields, content and category; Supabase applies every field.
  async previewExperience(id: string, patch: ExperiencePatch, layout?: CategoryLayout): Promise<Experience | null> {
    const e = this.experiences.find((x) => x.id === id);
    if (!e) return null;
    const draft: Experience = {
      ...e,
      title: patch.title ?? e.title,
      verdict: patch.verdict ?? e.verdict,
      about: patch.about ?? e.about,
      content: patch.content ?? e.content,
    };
    return this.withCategory(draft, patch.categoryId !== undefined ? patch.categoryId : (this.categoryOf.get(id) ?? null), layout);
  }

  private siteSettings: SiteSettings = {};

  async getSiteSettings(): Promise<SiteSettings> {
    return this.siteSettings;
  }

  async saveSiteSettings(settings: SiteSettings): Promise<SiteSettings> {
    this.siteSettings = settings;
    return settings;
  }

  private homeFeed: HomeSection[] | null = null;

  async getHomeFeed(): Promise<HomeSection[] | null> {
    return this.homeFeed;
  }

  async saveHomeFeed(sections: HomeSection[]): Promise<HomeSection[]> {
    this.homeFeed = sections;
    return sections;
  }

  async listCategories(): Promise<Category[]> {
    return [...this.categories.values()]
      .map((c) => ({ ...c, listingCount: [...this.categoryOf.values()].filter((x) => x === c.id).length }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getCategory(id: string): Promise<Category | null> {
    return this.categories.get(id) ?? null;
  }

  async createCategory(input: { name: string; slug: string; layout: CategoryLayout }): Promise<Category> {
    if ([...this.categories.values()].some((c) => c.slug === input.slug)) throw new ValidationError("That slug is taken.");
    const c: Category = { id: crypto.randomUUID(), ...input };
    this.categories.set(c.id, c);
    return c;
  }

  async updateCategory(id: string, input: CategoryInput): Promise<Category> {
    const c = this.categories.get(id);
    if (!c) throw new Error(`Category ${id} not found`);
    if (input.slug !== undefined && [...this.categories.values()].some((x) => x.slug === input.slug && x.id !== id)) throw new ValidationError("That slug is taken.");
    const next = { ...c, ...(input.name !== undefined ? { name: input.name } : {}), ...(input.slug !== undefined ? { slug: input.slug } : {}), ...(input.layout !== undefined ? { layout: input.layout } : {}) };
    this.categories.set(id, next);
    return next;
  }

  async deleteCategory(id: string): Promise<void> {
    const used = [...this.categoryOf.values()].filter((x) => x === id).length;
    if (used) throw new ValidationError(`${used} listing${used === 1 ? " still uses" : "s still use"} this category. Move them first.`);
    this.categories.delete(id);
  }

  async getAdminById(id: string): Promise<ExperienceAdmin | null> {
    const e = this.experiences.find((x) => x.id === id);
    if (!e) return null;
    return this.toAdmin(e);
  }

  async listCards(): Promise<ListingCard[]> {
    return this.experiences
      .filter((e) => {
        if ((this.statuses.get(e.id) ?? "published") !== "published") return false;
        const hostId = this.experienceHostId.get(e.id);
        const host = hostId ? this.hosts.get(hostId) : undefined;
        return !host || host.active;
      })
      .map((e) => {
        const custom = this.covers.get(e.id);
        const cover = custom ? { src: custom.url, alt: custom.alt } : e.photos[0];
        const category = this.categories.get(this.categoryOf.get(e.id) ?? "");
        return {
          slug: e.slug,
          title: e.title,
          placeLabel: e.place.neighborhood,
          imageSrc: cover?.src,
          imageAlt: cover?.alt,
          priceInr: e.price.askForPrice ? undefined : e.price.fromAmount,
          priceAsk: e.price.askForPrice || undefined,
          blurb: e.verdict || undefined,
          durationMinutes: e.durationMinutes || undefined,
          format: e.content?.format,
          ...(category ? { categoryName: category.name, categorySlug: category.slug } : {}),
        };
      });
  }

  async listExperiences(): Promise<ExperienceSummary[]> {
    return this.experiences.map((e) => {
      const hostId = this.experienceHostId.get(e.id) ?? null;
      const host = hostId ? this.hosts.get(hostId) : undefined;
      return {
        id: e.id,
        slug: e.slug,
        title: e.title,
        status: this.statuses.get(e.id) ?? "published",
        verdict: e.verdict,
        priceFromInr: e.price.fromAmount,
        hostId,
        hostBusinessName: host?.businessName ?? e.host?.businessName ?? "",
        hostActive: host?.active ?? true,
        categoryId: this.categoryOf.get(e.id) ?? null,
        placeNeighborhood: e.place.neighborhood,
        hasPhoto: e.photos.length > 0 || this.covers.has(e.id),
      };
    });
  }

  async listHosts(): Promise<HostSummary[]> {
    return [...this.hosts.values()].map((h) => ({
      id: h.id,
      businessName: h.businessName,
      personName: h.personName,
      phone: h.phone,
      experienceCount: [...this.experienceHostId.values()].filter(
        (id) => id === h.id,
      ).length,
      active: h.active,
      avatarUrl: h.avatarUrl,
      avatarAlt: h.avatarAlt,
      credit: h.credit,
    }));
  }

  async createExperience(input: ExperienceCreate): Promise<ExperienceAdmin> {
    if ([...this.experiences].some((e) => e.slug === input.slug)) {
      throw new Error("Slug already taken");
    }
    const host = input.hostId ? this.hosts.get(input.hostId) : undefined;
    if (input.hostId && !host) throw new Error(`Host ${input.hostId} not found`);

    const id = crypto.randomUUID();
    const experience: Experience = {
      id,
      slug: input.slug!,
      title: input.title,
      host: host
        ? {
            businessName: host.businessName,
            personName: host.personName,
            phone: host.phone,
            verified: false,
            languages: [],
          }
        : null,
      photos: [],
      verdict: input.verdict?.trim() ?? "",
      price: {
        fromAmount: input.priceFromInr ?? 0,
        paidTo: "paid to the host",
      },
      place: {
        name: input.placeName,
        neighborhood: input.placeNeighborhood,
        lat: input.placeLat,
        lng: input.placeLng,
      },
      schedule: {},
      durationMinutes: input.durationMinutes ?? 120,
      groupSizeLabel:
        input.groupSizeLabel ??
        "Come solo, as a couple, with friends or with family.",
      about: input.about ?? "",
      included: [],
      tags: [],
      content: {},
    };
    this.experiences.push(experience);
    this.statuses.set(id, input.status ?? "draft");
    this.groupSizeMax.set(id, input.groupSizeMax ?? 8);
    if (host) this.experienceHostId.set(id, host.id);
    if (input.categoryId) this.categoryOf.set(id, input.categoryId);
    return this.toAdmin(experience);
  }

  async updateExperience(
    id: string,
    patch: ExperiencePatch,
  ): Promise<ExperienceAdmin> {
    const e = this.experiences.find((x) => x.id === id);
    if (!e) throw new Error(`Experience ${id} not found`);

    if (patch.categoryId !== undefined) {
      if (patch.categoryId) this.categoryOf.set(id, patch.categoryId);
      else this.categoryOf.delete(id);
    }
    if (patch.hostId !== undefined) {
      const next = patch.hostId ? this.hosts.get(patch.hostId) : undefined;
      if (patch.hostId && !next) throw new Error(`Host ${patch.hostId} not found`);
      if (next) this.experienceHostId.set(id, next.id);
      else this.experienceHostId.delete(id);
      e.host = next
        ? { businessName: next.businessName, personName: next.personName, phone: next.phone, verified: false, languages: [], credit: next.credit }
        : null;
    }
    if (patch.slug !== undefined) {
      const clash = this.experiences.find(
        (x) => x.slug === patch.slug && x.id !== id,
      );
      if (clash) throw new Error("Slug already taken");
      e.slug = patch.slug.trim();
    }
    if (patch.title !== undefined) e.title = patch.title.trim();
    if (patch.verdict !== undefined) e.verdict = (patch.verdict ?? "").trim();
    if (patch.about !== undefined) e.about = patch.about;
    if (patch.placeName !== undefined) e.place.name = patch.placeName.trim();
    if (patch.placeNeighborhood !== undefined) {
      e.place.neighborhood = patch.placeNeighborhood.trim();
    }
    if (patch.placeLat !== undefined) e.place.lat = patch.placeLat;
    if (patch.placeLng !== undefined) e.place.lng = patch.placeLng;
    if (patch.priceFromInr !== undefined) {
      e.price.fromAmount = patch.priceFromInr;
    }
    if (patch.durationMinutes !== undefined) {
      e.durationMinutes = patch.durationMinutes;
    }
    if (patch.groupSizeLabel !== undefined) {
      e.groupSizeLabel = patch.groupSizeLabel.trim();
    }
    if (patch.groupSizeMax !== undefined) {
      this.groupSizeMax.set(id, patch.groupSizeMax);
    }
    if (patch.status !== undefined) {
      this.statuses.set(id, patch.status);
    }
    if (patch.tags !== undefined) e.tags = [...patch.tags];
    if (patch.schedule !== undefined) {
      e.schedule = patch.schedule as Experience["schedule"];
    }
    if (patch.policy !== undefined) {
      e.policy = patch.policy ?? undefined;
    }
    if (patch.content !== undefined) e.content = patch.content;
    if (patch.coverPhotoUrl !== undefined) {
      if (!patch.coverPhotoUrl) this.covers.delete(id);
      else {
        this.covers.set(id, {
          url: patch.coverPhotoUrl,
          alt: patch.coverPhotoAlt?.trim() || e.title,
        });
      }
    }

    return this.toAdmin(e);
  }

  async deleteExperience(id: string): Promise<void> {
    const idx = this.experiences.findIndex((x) => x.id === id);
    if (idx < 0) throw new Error(`Experience ${id} not found`);
    this.experiences.splice(idx, 1);
    this.statuses.delete(id);
    this.groupSizeMax.delete(id);
    this.experienceHostId.delete(id);
  }

  async createHost(input: HostCreate): Promise<HostSummary> {
    const id = crypto.randomUUID();
    const credit = input.credit ?? "hosted";
    this.hosts.set(id, {
      id,
      businessName: input.businessName,
      personName: input.personName,
      phone: input.phone,
      active: input.active ?? true,
      credit,
    });
    return {
      id,
      businessName: input.businessName,
      personName: input.personName,
      phone: input.phone,
      experienceCount: 0,
      active: input.active ?? true,
      credit,
    };
  }

  async updateHost(id: string, patch: HostPatch): Promise<HostSummary> {
    const host = this.hosts.get(id);
    if (!host) throw new Error(`Host ${id} not found`);

    if (patch.businessName !== undefined) {
      host.businessName = patch.businessName.trim();
    }
    if (patch.personName !== undefined) {
      host.personName = patch.personName.trim();
    }
    if (patch.phone !== undefined) {
      host.phone = patch.phone.trim();
    }
    if (patch.active !== undefined) host.active = patch.active;
    if (patch.avatarUrl !== undefined) {
      host.avatarUrl = patch.avatarUrl || undefined;
    }
    if (patch.avatarAlt !== undefined) {
      host.avatarAlt = patch.avatarAlt || undefined;
    }
    if (patch.credit !== undefined) host.credit = patch.credit;

    for (const e of this.experiences) {
      if (e.host && this.experienceHostId.get(e.id) === id) {
        e.host.businessName = host.businessName;
        e.host.personName = host.personName;
        e.host.phone = host.phone;
        e.host.credit = host.credit;
        e.host.avatar = host.avatarUrl
          ? {
              src: host.avatarUrl,
              alt: host.avatarAlt || host.personName,
            }
          : undefined;
      }
    }

    return {
      id: host.id,
      businessName: host.businessName,
      personName: host.personName,
      phone: host.phone,
      experienceCount: [...this.experienceHostId.values()].filter(
        (hid) => hid === id,
      ).length,
      active: host.active,
      avatarUrl: host.avatarUrl,
      avatarAlt: host.avatarAlt,
      credit: host.credit,
    };
  }

  async deleteHost(id: string): Promise<void> {
    const stillLinked = [...this.experienceHostId.values()].some(
      (hid) => hid === id,
    );
    if (stillLinked) {
      throw new Error("Host still has listings");
    }
    if (!this.hosts.has(id)) throw new Error(`Host ${id} not found`);
    this.hosts.delete(id);
  }

  async addPhoto(experienceId: string, photo: Photo): Promise<void> {
    this.find(experienceId).photos.push({ ...photo });
  }

  async setPhotos(
    experienceId: string,
    items: Array<{ id: string; alt: string }>,
    coverId: string | null,
  ): Promise<void> {
    const e = this.find(experienceId);
    e.photos = reorder(e.photos, items, (p) => this.mediaId(p)).map((p, i) => {
      p.alt = items[i].alt;
      return p;
    });
    if (coverId) this.coverIds.set(experienceId, coverId);
    else this.coverIds.delete(experienceId);
  }

  async deletePhoto(experienceId: string, photoId: string): Promise<void> {
    const e = this.find(experienceId);
    e.photos = e.photos.filter((p) => this.mediaId(p) !== photoId);
  }

  async addMenuPage(experienceId: string, page: MenuPage): Promise<void> {
    const e = this.find(experienceId);
    e.menu = { pages: [...(e.menu?.pages ?? []), { ...page }] };
  }

  async setMenuPages(
    experienceId: string,
    items: Array<{ id: string; label: string; alt: string }>,
  ): Promise<void> {
    const e = this.find(experienceId);
    const pages = reorder(e.menu?.pages ?? [], items, (p) => this.mediaId(p));
    pages.forEach((p, i) => {
      p.label = items[i].label;
      p.alt = items[i].alt;
    });
    e.menu = { pages };
  }

  async deleteMenuPage(experienceId: string, pageId: string): Promise<void> {
    const e = this.find(experienceId);
    e.menu = {
      pages: (e.menu?.pages ?? []).filter((p) => this.mediaId(p) !== pageId),
    };
  }

  private find(id: string): Experience {
    const e = this.experiences.find((x) => x.id === id);
    if (!e) throw new Error(`Experience ${id} not found`);
    return e;
  }

  private mediaId(item: object): string {
    let id = this.mediaIds.get(item);
    if (!id) {
      id = crypto.randomUUID();
      this.mediaIds.set(item, id);
    }
    return id;
  }

  private toAdmin(e: Experience): ExperienceAdmin {
    const schedule = e.schedule as ExperienceAdmin["schedule"];
    const hostId = this.experienceHostId.get(e.id) ?? null;
    return {
      id: e.id,
      slug: e.slug,
      title: e.title,
      status: this.statuses.get(e.id) ?? "published",
      verdict: e.verdict,
      about: e.about,
      placeName: e.place.name,
      placeNeighborhood: e.place.neighborhood,
      placeLat: e.place.lat,
      placeLng: e.place.lng,
      priceFromInr: e.price.fromAmount,
      durationMinutes: e.durationMinutes,
      groupSizeMax: this.groupSizeMax.get(e.id) ?? 6,
      groupSizeLabel: e.groupSizeLabel,
      hostId,
      hostBusinessName: e.host?.businessName ?? "",
      coverPhotoUrl: this.covers.get(e.id)?.url ?? e.photos[0]?.src,
      coverPhotoAlt: this.covers.get(e.id)?.alt ?? e.photos[0]?.alt,
      photos: e.photos.map((p) => ({
        id: this.mediaId(p),
        src: p.src,
        alt: p.alt,
        isCover: this.coverIds.get(e.id) === this.mediaId(p),
      })),
      menuPages: (e.menu?.pages ?? []).map((p) => ({
        id: this.mediaId(p),
        src: p.src,
        label: p.label,
        alt: p.alt,
      })),
      tags: [...e.tags],
      categoryId: this.categoryOf.get(e.id) ?? null,
      schedule: schedule ?? {},
      policy: e.policy ?? null,
      content: e.content ?? {},
    };
  }
}
