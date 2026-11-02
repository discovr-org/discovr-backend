import type { ListingCard } from "../domain/experience.js";
import type { ExperienceRepository } from "./ports/experience-repository.js";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Listing cards, kept in memory for `ttlMs` so most requests skip the database. */
export class ListCards {
  private cached: { cards: ListingCard[]; expiresAt: number } | null = null;
  private inFlight: Promise<ListingCard[]> | null = null;

  constructor(
    private readonly repo: ExperienceRepository,
    private readonly ttlMs: number = DAY_MS,
    private readonly now: () => number = Date.now,
  ) {}

  execute(): Promise<ListingCard[]> {
    if (this.cached && this.cached.expiresAt > this.now()) {
      return Promise.resolve(this.cached.cards);
    }
    return this.load();
  }

  /** Drop the cached cards. The next request reads the database again. */
  invalidate(): void {
    this.cached = null;
    // A read already in flight may hold pre-edit data; don't let it fill the cache.
    this.inFlight = null;
  }

  /** Drop the cache and load a fresh copy now. */
  refresh(): Promise<ListingCard[]> {
    this.invalidate();
    return this.load();
  }

  private load(): Promise<ListingCard[]> {
    // Concurrent misses share one database read.
    if (this.inFlight) return this.inFlight;
    const started = this.repo
      .listCards()
      .then((cards) => {
        if (this.inFlight === started) {
          this.cached = { cards, expiresAt: this.now() + this.ttlMs };
        }
        return cards;
      })
      .finally(() => {
        if (this.inFlight === started) this.inFlight = null;
      });
    this.inFlight = started;
    return started;
  }
}
