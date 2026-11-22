import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { CatalogService } from "../../catalog/api/catalog-service.js";
import type { ExperiencePatch } from "../../catalog/domain/experience.js";
import { editVector, lexemes } from "../../catalog/domain/search-vector.js";
import { listingBasics, listingExtras, toContent } from "../domain/listing-input.js";
import { parseMapsCoords } from "../domain/maps-link.js";
import { defined, run } from "./tool-result.js";

const id = z.string().describe("Id from list_listings or find_hosts.");
const editable = {
  ...z.object(listingBasics).omit({ hostId: true }).partial().shape,
  hostId: z.string().nullable().optional().describe("Host id, or null to remove the host."),
  categoryId: z.string().nullable().optional().describe("Category id, or null to give the listing its own layout."),
};

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
    "get_photo_upload_link",
    {
      description:
        "Link where a human uploads photos (cover, carousel, menu pages, story photos) for a listing, or the host avatar. You can't receive photos in chat, so give the user this link after creating a draft.",
      inputSchema: {
        kind: z.enum(["listing", "host"]),
        id: z.string().describe("Listing id, or host id."),
      },
      annotations: { readOnlyHint: true },
    },
    ({ kind, id }) =>
      run(async () => {
        if (kind === "listing") {
          const row = await catalog.getAdminExperienceById(id); // throws if the id is wrong
          return {
            link: `${adminUrl}/listings/${row.id}#sec-photos`,
            note: "Opens the listing's Photos section. Upload the cover and carousel there. Menu pages and story photos are further down the page.",
          };
        }
        const { hosts } = await catalog.getHosts();
        if (!hosts.some((h) => h.id === id)) throw new Error(`Host ${id} not found`);
        return { link: `${adminUrl}/hosts`, note: "Find the host in the list and upload the avatar on its row." };
      }),
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
        "Change fields on a listing. Send only what changes. Lists (faqs, included, carry, tags...) replace the old list, so send the full list. Can change the host (hostId, or null for none) and the category (categoryId, or null for its own layout). Can't change status or slug.",
      inputSchema: { id, ...editable, ...listingExtras },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
    },
    ({ id, tags, schedule, policy, content, ...basics }) =>
      run(async () => {
        // The repo replaces content/schedule wholesale, so merge into what's there.
        const now = await catalog.getAdminExperienceById(id);
        // A new map link moves the pin, unless coordinates were sent too.
        const at = basics.placeLat === undefined && basics.placeLng === undefined ? parseMapsCoords(content?.links?.maps?.url ?? "") : null;
        const patch: ExperiencePatch = defined({
          ...basics,
          ...(at ? { placeLat: at.lat, placeLng: at.lng } : {}),
          tags,
          policy,
          schedule: schedule && { ...now.schedule, ...defined(schedule) },
          content: content && {
            ...now.content,
            ...defined(toContent(content)),
            links: { ...now.content?.links, ...content.links },
          },
        });
        const saved = await catalog.patchExperience(id, patch);
        return { id: saved.id, status: saved.status, review: `${adminUrl}/listings/${saved.id}` };
      }),
  );

  server.registerTool(
    "get_search_vector",
    {
      description:
        "The words guest search matches for a listing (its stored search vector). Title, neighborhood and verdict start in it; you can add more.",
      inputSchema: { id },
      annotations: { readOnlyHint: true },
    },
    ({ id }) =>
      run(async () => {
        const vector = await catalog.getSearchVector(id);
        return { words: lexemes(vector), vector };
      }),
  );

  server.registerTool(
    "update_search_vector",
    {
      description:
        "Change the words guest search matches for a listing. 'add' keeps the old words and adds yours, 'remove' takes yours out, 'replace' swaps everything. Words are lowercased and split on spaces; give base-form words (beach, not beaches). Editing the title, neighborhood or verdict later rebuilds the vector and drops added words, so re-add them after such edits.",
      inputSchema: {
        id,
        mode: z.enum(["add", "remove", "replace"]),
        terms: z.array(z.string()).describe("Words or short phrases, e.g. ['sunset', 'beach bar', 'nightlife']."),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
    },
    ({ id, mode, terms }) =>
      run(async () => {
        const next = editVector(mode === "replace" ? "" : await catalog.getSearchVector(id), mode, terms);
        const vector = await catalog.setSearchVector(id, next);
        return { words: lexemes(vector), vector };
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
