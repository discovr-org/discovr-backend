import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { CatalogService } from "../../catalog/api/catalog-service.js";
import type { ExperiencePatch } from "../../catalog/domain/experience.js";
import { listingBasics, listingExtras } from "../domain/listing-input.js";
import { defined, run } from "./tool-result.js";

const id = z.string().describe("Id from list_listings or find_hosts.");
const editable = z.object(listingBasics).omit({ hostId: true }).partial().shape;

/**
 * Tools that change things that already exist. Status and active only move through their own
 * tools, so the client can ask the human before each one.
 */
export function registerEditTools(server: McpServer, catalog: CatalogService, adminUrl: string) {
  server.registerTool(
    "get_listing",
    {
      description: "Full detail of one listing, as the admin edit page sees it.",
      inputSchema: { id },
      annotations: { readOnlyHint: true },
    },
    ({ id }) => run(() => catalog.getAdminExperienceById(id)),
  );

  server.registerTool(
    "needs_attention",
    {
      description:
        "Listings with gaps: no verdict, no photo, no price, or published with an inactive host. Same list as the admin Dashboard.",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    () =>
      run(async () => {
        const { experiences } = await catalog.getExperiences();
        return experiences
          .filter((x) => x.status !== "archived")
          .map((x) => ({
            id: x.id,
            title: x.title,
            status: x.status,
            gaps: [
              !x.verdict?.trim() && "no verdict",
              !x.hasPhoto && "no photo",
              !x.priceFromInr && "no price",
              x.status === "published" && !x.hostActive && "host is inactive",
            ].filter(Boolean),
          }))
          .filter((x) => x.gaps.length);
      }),
  );

  server.registerTool(
    "update_listing",
    {
      description:
        "Change fields on a listing. Send only what changes. Lists (faqs, included, carry, tags...) replace the old list, so send the full list. Can't change status, slug or host.",
      inputSchema: { id, ...editable, ...listingExtras },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
    },
    ({ id, tags, schedule, policy, content, ...basics }) =>
      run(async () => {
        // The repo replaces content/schedule wholesale, so merge into what's there.
        const now = await catalog.getAdminExperienceById(id);
        const patch: ExperiencePatch = defined({
          ...basics,
          tags,
          policy,
          schedule: schedule && { ...now.schedule, ...defined(schedule) },
          content: content && {
            ...now.content,
            ...defined(content),
            links: { ...now.content?.links, ...content.links },
          },
        });
        const saved = await catalog.patchExperience(id, patch);
        return { id: saved.id, status: saved.status, review: `${adminUrl}/listings/${saved.id}` };
      }),
  );

  server.registerTool(
    "set_listing_status",
    {
      description:
        "Publish, unpublish (draft) or archive a listing. Publishing puts it in front of guests and needs a verdict. Only call when the user asked for it.",
      inputSchema: { id, status: z.enum(["draft", "published", "archived"]) },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
    },
    ({ id, status }) =>
      run(async () => {
        const saved = await catalog.patchExperience(id, { status });
        return { id: saved.id, title: saved.title, status: saved.status };
      }),
  );

  server.registerTool(
    "update_host",
    {
      description: "Change a host's business name, contact name or phone. Send only what changes.",
      inputSchema: {
        id,
        businessName: z.string().optional(),
        personName: z.string().optional(),
        phone: z.string().optional(),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
    },
    ({ id, ...fields }) => run(() => catalog.patchHost(id, defined(fields))),
  );

  server.registerTool(
    "set_host_active",
    {
      description:
        "Switch a host on or off. Off hides all of that host's listings from guests. Only call when the user asked for it.",
      inputSchema: { id, active: z.boolean() },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
    },
    ({ id, active }) => run(() => catalog.patchHost(id, { active })),
  );
}
