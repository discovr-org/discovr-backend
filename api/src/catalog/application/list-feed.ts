import type { FeedSection } from "../domain/experience.js";
import type { ExperienceRepository } from "./ports/experience-repository.js";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Home feed, kept in memory for `ttlMs` so most requests skip the database. */
export class ListFeed {
  private cached: { sections: FeedSection[]; expiresAt: number } | null = null;
  private inFlight: Promise<FeedSection[]> | null = null;

  constructor(
    private readonly repo: ExperienceRepository,
    private readonly ttlMs: number = DAY_MS,
    private readonly now: () => number = Date.now,
  ) {}

  execute(): Promise<FeedSection[]> {
    if (this.cached && this.cached.expiresAt > this.now()) {
      return Promise.resolve(this.cached.sections);
    }
    return this.load();
  }

  /** Drop the cached feed. The next request reads the database again. */
  invalidate(): void {
    this.cached = null;
    // A read already in flight may hold pre-edit data; don't let it fill the cache.
    this.inFlight = null;
  }

  /** Drop the cache and load a fresh copy now. */
  refresh(): Promise<FeedSection[]> {
    this.invalidate();
    return this.load();
  }

  private load(): Promise<FeedSection[]> {
    // Concurrent misses share one database read.
    if (this.inFlight) return this.inFlight;
    const started = this.repo
      .listFeed()
      .then((sections) => {
        if (this.inFlight === started) {
          this.cached = { sections, expiresAt: this.now() + this.ttlMs };
        }
        return sections;
      })
      .finally(() => {
        if (this.inFlight === started) this.inFlight = null;
      });
    this.inFlight = started;
    return started;
  }
}
