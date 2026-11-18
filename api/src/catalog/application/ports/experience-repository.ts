import type {
  Category,
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
  listCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | null>;
  createCategory(input: Required<Pick<CategoryInput, "name" | "slug">> & { layout: CategoryLayout }): Promise<Category>;
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
  createHost(input: HostCreate): Promise<HostSummary>;
  updateHost(id: string, patch: HostPatch): Promise<HostSummary>;
  deleteHost(id: string): Promise<void>;
}
