import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { CatalogService } from "../../catalog/api/catalog-service.js";
import { listingBasics, listingExtras } from "../domain/listing-input.js";

const text = (value: unknown) => ({
  content: [{ type: "text" as const, text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }],
});

/** Errors go back to the AI as text so it can fix the input and retry. */
async function run(fn: () => Promise<unknown>) {
  try {
    return text(await fn());
  } catch (err) {
    return { ...text(err instanceof Error ? err.message : "Something went wrong."), isError: true };
  }
}

/**
 * Tools the AI can call. Every write is a draft: status and active are fixed here,
 * never taken from the AI. Publishing stays a human click in the admin.
 */
export function registerTools(server: McpServer, catalog: CatalogService, adminUrl: string) {
  server.registerTool(
    "find_hosts",
    {
      description:
        "Search hosts by business name, contact name or phone. Call this before create_host_draft so you don't make a duplicate.",
      inputSchema: { query: z.string().describe("Part of a name or phone. Empty = list all.") },
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
    },
    ({ query }) =>
      run(async () => {
        const q = query.trim().toLowerCase();
        const { experiences } = await catalog.getExperiences();
        return experiences.filter((r) => `${r.title} ${r.slug}`.toLowerCase().includes(q));
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
        "Create a listing as a draft (never published). Needs a hostId. Text only: no photos. If lat/lng or the host are unknown, ask the user first.",
      inputSchema: { ...listingBasics, ...listingExtras },
    },
    ({ tags, schedule, policy, content, ...basics }) =>
      run(async () => {
        const created = await catalog.addExperience({ ...basics, status: "draft" });
        const extras = { tags, schedule, policy, content };
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
          note: "Draft saved. Photos still need adding in the admin.",
        };
      }),
  );
}
