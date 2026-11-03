import type { ExperienceAdmin } from "../domain/experience.js";
import { assertSameIds, cleanAlt, requireAdminExperience } from "./experience-photos.js";
import type { ExperienceMediaRepository } from "./ports/experience-media-repository.js";
import type { ExperienceRepository } from "./ports/experience-repository.js";

/** Reorder menu pages, edit labels and alt text. */
export class UpdateMenuPages {
  constructor(
    private readonly repo: ExperienceRepository,
    private readonly media: ExperienceMediaRepository,
  ) {}

  async execute(
    experienceId: string,
    items: Array<{ id: string; label?: string; alt?: string }>,
  ): Promise<ExperienceAdmin> {
    const row = await requireAdminExperience(this.repo, experienceId);
    assertSameIds(
      row.menuPages.map((p) => p.id),
      items.map((i) => i.id),
      "menu page",
    );
    const byId = new Map(row.menuPages.map((p) => [p.id, p]));
    await this.media.setMenuPages(
      experienceId,
      items.map((i) => {
        const page = byId.get(i.id)!;
        return {
          id: i.id,
          label: cleanAlt(i.label, page.label),
          alt: cleanAlt(i.alt, page.alt),
        };
      }),
    );
    return requireAdminExperience(this.repo, experienceId);
  }
}
