import type { CatalogClient } from "../application/ports/catalog-client.js";

export class CatalogHttpClient implements CatalogClient {
  constructor(private readonly baseUrl: string) {}

  getFeed() {
    return this.get("/internal/v1/feed");
  }

  getExperience(slug: string) {
    return this.get(`/internal/v1/experiences/${encodeURIComponent(slug)}`);
  }

  private async get(path: string): Promise<{ status: number; body: unknown }> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: { accept: "application/json" },
    });
    const body = await res.json().catch(() => ({
      error: { code: "bad_gateway", message: "Catalog returned non-JSON" },
    }));
    return { status: res.status, body };
  }
}
