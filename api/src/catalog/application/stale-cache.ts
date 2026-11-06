const FRESH_MS = 20 * 1000;
const MAX_STALE_MS = 5 * 60 * 1000;

/**
 * One value kept in memory. Fresh: returned as is. Slightly old: returned at once while a
 * refresh runs in the background. Too old or empty: waits for the database.
 * Concurrent loads share one database read.
 */
export class StaleCache<T> {
  private value: { data: T; at: number } | null = null;
  private inFlight: Promise<T> | null = null;

  constructor(
    private readonly load: () => Promise<T>,
    private readonly now: () => number = Date.now,
  ) {}

  get(): Promise<T> {
    if (this.value) {
      const age = this.now() - this.value.at;
      if (age < FRESH_MS) return Promise.resolve(this.value.data);
      if (age < MAX_STALE_MS) {
        void this.refresh().catch(() => {});
        return Promise.resolve(this.value.data);
      }
    }
    return this.refresh();
  }

  /** After a write: drop the old copy and start loading a new one right away. */
  invalidate(): void {
    this.value = null;
    this.inFlight = null;
    void this.refresh().catch(() => {});
  }

  private refresh(): Promise<T> {
    if (this.inFlight) return this.inFlight;
    const started = this.load()
      .then((data) => {
        // An invalidate() while we were reading means this copy may be pre-edit: don't keep it.
        if (this.inFlight === started) this.value = { data, at: this.now() };
        return data;
      })
      .finally(() => {
        if (this.inFlight === started) this.inFlight = null;
      });
    this.inFlight = started;
    return started;
  }
}
