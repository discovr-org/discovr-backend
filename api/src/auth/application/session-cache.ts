/** Session lookups kept for a short time so signed-in requests skip the database. */
const TTL_MS = 60 * 1000;
const MAX = 10_000;

export class SessionCache {
  private readonly rows = new Map<string, { userId: string; until: number }>();

  get(tokenHash: string): string | null {
    const row = this.rows.get(tokenHash);
    if (!row) return null;
    if (row.until <= Date.now()) {
      this.rows.delete(tokenHash);
      return null;
    }
    return row.userId;
  }

  set(tokenHash: string, userId: string): void {
    if (this.rows.size >= MAX) this.rows.delete(this.rows.keys().next().value as string);
    this.rows.set(tokenHash, { userId, until: Date.now() + TTL_MS });
  }

  delete(tokenHash: string): void {
    this.rows.delete(tokenHash);
  }
}
