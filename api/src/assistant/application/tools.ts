import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { CatalogService } from "../../catalog/api/catalog-service.js";
import { listingBasics, listingExtras, toContent } from "../domain/listing-input.js";
import { parseMapsCoords } from "../domain/maps-link.js";
import { registerCategoryTools } from "./category-tools.js";
import { registerEditTools } from "./edit-tools.js";
import type { PlaceFinder } from "./ports/place-finder.js";
import { run } from "./tool-result.js";

/**
 * Tools the AI can call. Every write is a draft: status and active are fixed here,
 * never taken from the AI. Publishing stays a human click in the admin.
 */
export function registerTools(
  server: McpServer,
  catalog: CatalogService,
  places: PlaceFinder,
  adminUrl: string,
) {
  registerEditTools(server, catalog, adminUrl);
  registerCategoryTools(server, catalog, adminUrl);

  server.registerTool(
    "find_place",
    {
      description:
        "Get lat/lng for a place. Pass a place name ('Britto's Baga') or a Google Maps link. Returns up to 5 matches with address: if more than one fits, ask the user which. Never guess coordinates.",
      inputSchema: { query: z.string() },
      annotations: { readOnlyHint: true },
    },
    ({ query }) => run(() => places.find(query)),
  );

  server.registerTool(
    "find_hosts",
    {
      description:
        "Search hosts by business name, contact name or phone. Call this before create_host_draft so you don't make a duplicate.",
      inputSchema: { query: z.string().describe("Part of a name or phone. Empty = list all.") },
      annotations: { readOnlyHint: true },
    },
    ({ query }) =>
      run(async () => {
        const q = query.trim().toLowerCase();
        const { hosts } = await catalog.getHosts();
        return hosts.filter((h) =>
          [h.businessName, h.personName, h.phone].some((v) => v.toLowerCase().includes(q)),
        );
      }),
  );

  server.registerTool(
    "list_listings",
    {
      description: "Search existing listings by title or slug. Read only. Use it to avoid duplicates.",
      inputSchema: { query: z.string().describe("Part of a title or slug. Empty = list all.") },
      annotations: { readOnlyHint: true },
    },
    ({ query }) =>
      run(async () => {
        const q = query.trim().toLowerCase();
        const { experiences } = await catalog.getExperiences();
        return experiences.filter((r) => `${r.title} ${r.slug}`.toLowerCase().includes(q));
      }),
  );

  server.registerTool(
    "list_categories",
    {
      description:
        "A short list of the page layouts a listing can join, like Sundowners or Surfing (for the full stored layouts use list_category_layouts). Pick the one that fits and pass its id as categoryId when you create the listing. A category fixes the page layout; the listing only fills in its content. If none fits, ask the user.",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    () =>
      run(async () => {
        const { categories } = await catalog.getCategories();
        return categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, listings: c.listingCount }));
      }),
  );

  server.registerTool(
    "create_host_draft",
    {
      description: "Create a host as an inactive draft. A human reviews and turns it on in the admin.",
      inputSchema: {
        businessName: z.string(),
        personName: z.string().describe("Contact person."),
        phone: z.string().describe("Contact phone."),
      },
    },
    (input) =>
      run(async () => {
        const host = await catalog.addHost({ ...input, active: false });
        return { host, review: `${adminUrl}/hosts`, note: "Draft: host is inactive until a human turns it on." };
      }),
  );

  server.registerTool(
    "create_listing_draft",
    {
      description:
        "Create a listing as a draft (never published). A host is optional: leave hostId out for a place with no host. Pass categoryId (from list_categories) to use a page layout. Text only: no photos. If lat/lng are unknown, ask the user first.",
      inputSchema: { ...listingBasics, ...listingExtras },
    },
    ({ tags, schedule, policy, content, placeLat, placeLng, ...basics }) =>
      run(async () => {
        // The map link is the input, as in the admin: the pin is read out of it unless coordinates were given.
        const at = placeLat !== undefined && placeLng !== undefined ? { lat: placeLat, lng: placeLng } : parseMapsCoords(content?.links?.maps?.url ?? "");
        if (!at) throw new Error("Need the place's position. Pass content.links.maps with a long Google Maps link (the pin is in it), or call find_place and pass placeLat and placeLng. Never guess.");
        const created = await catalog.addExperience({ ...basics, placeLat: at.lat, placeLng: at.lng, status: "draft" });
        const extras = { tags, schedule, policy, content: content && toContent(content) };
        const hasExtras = Object.values(extras).some((v) => v !== undefined);
        // ponytail: two calls (create, then patch) because create only takes the basics; not atomic.
        const saved = hasExtras
          ? await catalog.patchExperience(created.id, JSON.parse(JSON.stringify(extras)))
          : created;
        return {
          id: saved.id,
          slug: saved.slug,
          status: saved.status,
          review: `${adminUrl}/listings/${saved.id}`,
          note: "Draft saved. No photos yet: call get_photo_upload_link and give the user the link.",
        };
      }),
  );
}
