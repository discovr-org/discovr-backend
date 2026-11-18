import type {
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
  previewExperience(id: string, patch: ExperiencePatch): Promise<Experience | null>;
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
