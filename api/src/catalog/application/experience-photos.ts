import { NotFoundError, ValidationError } from "../domain/errors.js";
import type { ExperienceAdmin } from "../domain/experience.js";
import type { ExperienceMediaRepository } from "./ports/experience-media-repository.js";
import type { ExperienceRepository } from "./ports/experience-repository.js";

export async function requireAdminExperience(
  repo: ExperienceRepository,
  id: string,
): Promise<ExperienceAdmin> {
  const row = await repo.getAdminById(id);
  if (!row) throw new NotFoundError(`Experience ${id} not found`);
  return row;
}

export function cleanAlt(value: unknown, fallback: string): string {
  const text = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  return (text || fallback).slice(0, 200);
}

/**
 * Write photo order + cover flag, then copy the cover into `cover_photo_*`
 * so cards and search keep reading one column.
 */
export async function applyPhotos(
  repo: ExperienceRepository,
  media: ExperienceMediaRepository,
  experienceId: string,
  items: Array<{ id: string; src: string; alt: string }>,
  coverId: string | null,
): Promise<ExperienceAdmin> {
  const cover = items.find((p) => p.id === coverId) ?? items[0] ?? null;
  await media.setPhotos(
    experienceId,
    items.map(({ id, alt }) => ({ id, alt })),
    cover?.id ?? null,
  );
  return repo.updateExperience(experienceId, {
    coverPhotoUrl: cover?.src ?? null,
    coverPhotoAlt: cover?.alt ?? null,
  });
}

export function assertSameIds(existing: string[], next: string[], what: string): void {
  const a = [...existing].sort().join(",");
  const b = [...next].sort().join(",");
  if (a !== b || new Set(next).size !== next.length) {
    throw new ValidationError(`Send every ${what} of this listing once, in the new order.`);
  }
}
