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
import { UploadContentImage } from "../application/upload-content-image.js";
import { UploadHostAvatar } from "../application/upload-host-avatar.js";
import { AddExperiencePhoto } from "../application/add-experience-photo.js";
import { AddMenuPage } from "../application/add-menu-page.js";
import { DeleteExperiencePhoto } from "../application/delete-experience-photo.js";
import { DeleteMenuPage } from "../application/delete-menu-page.js";
import type { ImageFile } from "../application/image-file.js";
import type { ExperienceMediaRepository } from "../application/ports/experience-media-repository.js";
import { UpdateExperiencePhotos } from "../application/update-experience-photos.js";
import { UpdateMenuPages } from "../application/update-menu-pages.js";
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
  private readonly addExperiencePhoto: AddExperiencePhoto | null;
  private readonly updateExperiencePhotos: UpdateExperiencePhotos;
  private readonly deleteExperiencePhoto: DeleteExperiencePhoto;
  private readonly addMenuPage: AddMenuPage | null;
  private readonly updateMenuPages: UpdateMenuPages;
  private readonly deleteMenuPage: DeleteMenuPage;
  private readonly uploadContentImage: UploadContentImage | null;
  private readonly uploadHostAvatar: UploadHostAvatar | null;

  constructor(
    repo: ExperienceRepository,
    media: ExperienceMediaRepository,
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
    this.addExperiencePhoto = images
      ? new AddExperiencePhoto(repo, media, images)
      : null;
    this.updateExperiencePhotos = new UpdateExperiencePhotos(repo, media);
    this.deleteExperiencePhoto = new DeleteExperiencePhoto(repo, media);
    this.addMenuPage = images ? new AddMenuPage(repo, media, images) : null;
    this.updateMenuPages = new UpdateMenuPages(repo, media);
    this.deleteMenuPage = new DeleteMenuPage(repo, media);
    this.uploadContentImage = images ? new UploadContentImage(images) : null;
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

  /** Adds the image as a carousel photo and makes it the cover. */
  async uploadCover(experienceId: string, file: ImageFile & { alt?: string }) {
    return this.uploadPhoto(experienceId, file, { alt: file.alt, makeCover: true });
  }

  async uploadPhoto(
    experienceId: string,
    file: ImageFile,
    options: { alt?: string; makeCover?: boolean } = {},
  ) {
    const row = await requireUploads(this.addExperiencePhoto).execute({
      experienceId,
      file,
      ...options,
    });
    this.listCards.invalidate();
    return presentExperienceAdmin(row);
  }

  async savePhotos(
    experienceId: string,
    items: Array<{ id: string; alt?: string }>,
    coverId: string | null,
  ) {
    const row = await this.updateExperiencePhotos.execute(experienceId, items, coverId);
    this.listCards.invalidate();
    return presentExperienceAdmin(row);
  }

  async removePhoto(experienceId: string, photoId: string) {
    const row = await this.deleteExperiencePhoto.execute(experienceId, photoId);
    this.listCards.invalidate();
    return presentExperienceAdmin(row);
  }

  async uploadMenuPage(
    experienceId: string,
    file: ImageFile,
    options: { label?: string; alt?: string } = {},
  ) {
    const row = await requireUploads(this.addMenuPage).execute({
      experienceId,
      file,
      ...options,
    });
    return presentExperienceAdmin(row);
  }

  async saveMenuPages(
    experienceId: string,
    items: Array<{ id: string; label?: string; alt?: string }>,
  ) {
    const row = await this.updateMenuPages.execute(experienceId, items);
    return presentExperienceAdmin(row);
  }

  async removeMenuPage(experienceId: string, pageId: string) {
    const row = await this.deleteMenuPage.execute(experienceId, pageId);
    return presentExperienceAdmin(row);
  }

  /** Upload a story image; returns `{ url }` for the caller to save into `content.blocks`. */
  async uploadImage(file: ImageFile) {
    return requireUploads(this.uploadContentImage).execute(file);
  }

  async uploadAvatar(hostId: string, file: ImageFile & { alt?: string }) {
    const row = await requireUploads(this.uploadHostAvatar).execute({
      hostId,
      ...file,
    });
    this.listCards.invalidate();
    return presentHostSummary(row);
  }
}

function requireUploads<T>(useCase: T | null): T {
  if (!useCase) {
    throw new ValidationError(
      "Image uploads aren't configured. Set the R2_* variables (or CLOUDFLARE_TOKEN).",
    );
  }
  return useCase;
}
