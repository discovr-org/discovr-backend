import { CreateExperience } from "../application/create-experience.js";
import { CreateHost } from "../application/create-host.js";
import { DeleteExperience } from "../application/delete-experience.js";
import { DeleteHost } from "../application/delete-host.js";
import { GetAdminExperience } from "../application/get-admin-experience.js";
import { GetExperience } from "../application/get-experience.js";
import { ListExperiences } from "../application/list-experiences.js";
import { ListCards } from "../application/list-cards.js";
import { ListHosts } from "../application/list-hosts.js";
import type { ExperienceRepository } from "../application/ports/experience-repository.js";
import type { ImageUploader } from "../application/ports/image-uploader.js";
import { UpdateExperience } from "../application/update-experience.js";
import { UpdateHost } from "../application/update-host.js";
import { UploadExperienceCover } from "../application/upload-experience-cover.js";
import { UploadHostAvatar } from "../application/upload-host-avatar.js";
import type {
  ExperienceCreate,
  ExperiencePatch,
  HostCreate,
  HostPatch,
} from "../domain/experience.js";
import { ValidationError } from "../domain/errors.js";
import {
  presentExperience,
  presentExperienceAdmin,
  presentExperienceSummaries,
  presentCards,
  presentHostSummaries,
  presentHostSummary,
} from "../infrastructure/presenters.js";

/** Public door into the catalog module. HTTP (and other modules) talk only here. */
export class CatalogService {
  private readonly getExperience: GetExperience;
  private readonly getAdminExperience: GetAdminExperience;
  private readonly listCards: ListCards;
  private readonly listExperiences: ListExperiences;
  private readonly listHosts: ListHosts;
  private readonly createExperience: CreateExperience;
  private readonly updateExperience: UpdateExperience;
  private readonly deleteExperience: DeleteExperience;
  private readonly createHost: CreateHost;
  private readonly updateHost: UpdateHost;
  private readonly deleteHost: DeleteHost;
  private readonly uploadExperienceCover: UploadExperienceCover | null;
  private readonly uploadHostAvatar: UploadHostAvatar | null;

  constructor(
    repo: ExperienceRepository,
    images: ImageUploader | null = null,
  ) {
    this.getExperience = new GetExperience(repo);
    this.getAdminExperience = new GetAdminExperience(repo);
    this.listCards = new ListCards(repo);
    this.listExperiences = new ListExperiences(repo);
    this.listHosts = new ListHosts(repo);
    this.createExperience = new CreateExperience(repo);
    this.updateExperience = new UpdateExperience(repo);
    this.deleteExperience = new DeleteExperience(repo);
    this.createHost = new CreateHost(repo);
    this.updateHost = new UpdateHost(repo);
    this.deleteHost = new DeleteHost(repo);
    this.uploadExperienceCover = images
      ? new UploadExperienceCover(repo, images)
      : null;
    this.uploadHostAvatar = images
      ? new UploadHostAvatar(repo, images)
      : null;
  }

  async getCards() {
    const cards = await this.listCards.execute();
    return presentCards(cards);
  }

  /** Clear the cached cards and cache a fresh copy. */
  async refreshCards() {
    const cards = await this.listCards.refresh();
    return { ok: true as const, cards: cards.length };
  }

  async getExperienceBySlug(slug: string) {
    const experience = await this.getExperience.execute(slug);
    return presentExperience(experience);
  }

  async getExperiences() {
    const rows = await this.listExperiences.execute();
    return presentExperienceSummaries(rows);
  }

  async getHosts() {
    const rows = await this.listHosts.execute();
    return presentHostSummaries(rows);
  }

  async getAdminExperienceById(id: string) {
    const row = await this.getAdminExperience.execute(id);
    return presentExperienceAdmin(row);
  }

  async addExperience(input: ExperienceCreate) {
    const row = await this.createExperience.execute(input);
    this.listCards.invalidate();
    return presentExperienceAdmin(row);
  }

  async patchExperience(id: string, patch: ExperiencePatch) {
    const row = await this.updateExperience.execute(id, patch);
    this.listCards.invalidate();
    return presentExperienceAdmin(row);
  }

  async removeExperience(id: string) {
    await this.deleteExperience.execute(id);
    this.listCards.invalidate();
    return { ok: true as const };
  }

  async addHost(input: HostCreate) {
    const row = await this.createHost.execute(input);
    this.listCards.invalidate();
    return presentHostSummary(row);
  }

  async patchHost(id: string, patch: HostPatch) {
    const row = await this.updateHost.execute(id, patch);
    this.listCards.invalidate();
    return presentHostSummary(row);
  }

  async removeHost(id: string) {
    await this.deleteHost.execute(id);
    this.listCards.invalidate();
    return { ok: true as const };
  }

  async uploadCover(
    experienceId: string,
    file: {
      bytes: Buffer;
      filename: string;
      contentType: string;
      alt?: string;
    },
  ) {
    if (!this.uploadExperienceCover) {
      throw new ValidationError(
        "Image uploads aren't configured. Set the R2_* variables (or CLOUDFLARE_TOKEN).",
      );
    }
    const row = await this.uploadExperienceCover.execute({
      experienceId,
      ...file,
    });
    this.listCards.invalidate();
    return presentExperienceAdmin(row);
  }

  async uploadAvatar(
    hostId: string,
    file: {
      bytes: Buffer;
      filename: string;
      contentType: string;
      alt?: string;
    },
  ) {
    if (!this.uploadHostAvatar) {
      throw new ValidationError(
        "Image uploads aren't configured. Set the R2_* variables (or CLOUDFLARE_TOKEN).",
      );
    }
    const row = await this.uploadHostAvatar.execute({
      hostId,
      ...file,
    });
    this.listCards.invalidate();
    return presentHostSummary(row);
  }
}
