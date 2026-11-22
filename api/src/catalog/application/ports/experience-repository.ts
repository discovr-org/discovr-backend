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
  ExperienceSummary,
  ListingCard,
  HostCreate,
  HostPatch,
  HostSummary,
} from "../../domain/experience.js";

/** Port: catalog persistence. Adapters: memory, supabase. */
export interface ExperienceRepository {
  getBySlug(slug: string): Promise<Experience | null>;
  getAdminById(id: string): Promise<ExperienceAdmin | null>;
  /** The guest page for a listing with `patch` applied in memory. Nothing is saved. */
  previewExperience(
    id: string,
    patch: ExperiencePatch,
    /** Show the page with this layout in place of the category's saved one. */
    layout?: CategoryLayout,
  ): Promise<Experience | null>;
  getSiteSettings(): Promise<SiteSettings>;
  saveSiteSettings(settings: SiteSettings): Promise<SiteSettings>;
  /** `null` until the admin saves a feed. */
  getHomeFeed(): Promise<HomeSection[] | null>;
  saveHomeFeed(sections: HomeSection[]): Promise<HomeSection[]>;
  listCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | null>;
  createCategory(input: Required<Pick<CategoryInput, "name" | "slug">> & { layout: CategoryLayout; weight?: number }): Promise<Category>;
  updateCategory(id: string, input: CategoryInput): Promise<Category>;
  /** Fails with a ValidationError-style message when listings still use it. */
  deleteCategory(id: string): Promise<void>;
  /** Published listings whose host is active. */
  listCards(): Promise<ListingCard[]>;
  listExperiences(): Promise<ExperienceSummary[]>;
  listHosts(): Promise<HostSummary[]>;
  createExperience(input: ExperienceCreate): Promise<ExperienceAdmin>;
  updateExperience(id: string, patch: ExperiencePatch): Promise<ExperienceAdmin>;
  deleteExperience(id: string): Promise<void>;
  /** The stored tsvector as text (`'word':1B ...`). `null` if no such listing. */
  getSearchVector(id: string): Promise<string | null>;
  setSearchVector(id: string, vector: string): Promise<string | null>;
  createHost(input: HostCreate): Promise<HostSummary>;
  updateHost(id: string, patch: HostPatch): Promise<HostSummary>;
  deleteHost(id: string): Promise<void>;
}
