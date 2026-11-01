import { NotFoundError, ValidationError } from "../domain/errors.js";
import type {
  ExperienceAdmin,
  ExperienceCreate,
  ExperienceStatus,
} from "../domain/experience.js";
import type { ExperienceRepository } from "./ports/experience-repository.js";

const STATUSES = new Set<ExperienceStatus>(["draft", "published", "archived"]);

function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export class CreateExperience {
  constructor(private readonly repo: ExperienceRepository) {}

  async execute(input: ExperienceCreate): Promise<ExperienceAdmin> {
    if (!input.title?.trim()) {
      throw new ValidationError("Title can't be empty.");
    }
    if (!input.hostId?.trim()) {
      throw new ValidationError("Pick a host.");
    }
    if (!input.placeName?.trim() || !input.placeNeighborhood?.trim()) {
      throw new ValidationError("Place name and neighborhood are required.");
    }
    if (
      typeof input.placeLat !== "number" ||
      typeof input.placeLng !== "number" ||
      Number.isNaN(input.placeLat) ||
      Number.isNaN(input.placeLng)
    ) {
      throw new ValidationError("Lat and lng must be numbers.");
    }

    const status = input.status ?? "draft";
    if (!STATUSES.has(status)) {
      throw new ValidationError("Status must be draft, published, or archived.");
    }
    const verdict = input.verdict?.trim() || null;
    if (status === "published" && !verdict) {
      throw new ValidationError("Published listings need a one-line verdict.");
    }

    const hosts = await this.repo.listHosts();
    if (!hosts.some((h) => h.id === input.hostId)) {
      throw new NotFoundError(`Host ${input.hostId} not found`);
    }

    const slug = (input.slug?.trim() || slugify(input.title)).trim();
    if (!slug) throw new ValidationError("Slug can't be empty.");

    try {
      return await this.repo.createExperience({
        ...input,
        title: input.title.trim(),
        slug,
        hostId: input.hostId.trim(),
        status,
        verdict,
        about: input.about ?? "",
        placeName: input.placeName.trim(),
        placeNeighborhood: input.placeNeighborhood.trim(),
        priceFromInr: Math.max(0, Math.round(input.priceFromInr ?? 0)),
        durationMinutes: Math.max(1, Math.round(input.durationMinutes ?? 120)),
        groupSizeMax: Math.max(1, Math.round(input.groupSizeMax ?? 8)),
        groupSizeLabel:
          input.groupSizeLabel?.trim() ||
          "Come solo, as a couple, with friends or with family.",
      });
    } catch (err) {
      if (err instanceof Error && err.message === "Slug already taken") {
        throw new ValidationError("That slug is already taken.");
      }
      throw err;
    }
  }
}
