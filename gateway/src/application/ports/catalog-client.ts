/** Port: talk to catalog. Gateway never imports catalog source. */
export interface CatalogClient {
  getFeed(): Promise<{ status: number; body: unknown }>;
  getExperience(slug: string): Promise<{ status: number; body: unknown }>;
}
