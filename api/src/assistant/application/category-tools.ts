import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { CatalogService } from "../../catalog/api/catalog-service.js";
import { fieldsForLayout, isFilled } from "../domain/layout-fields.js";
import { effectiveSections, fixedShown, LAYOUT_GUIDE, layoutInput } from "../domain/layout-input.js";
import { defined, run } from "./tool-result.js";

const slim = (x: { id: string; slug: string; title: string; status: string }) => ({ id: x.id, slug: x.slug, title: x.title, status: x.status });

/**
 * Category layouts: read what is stored, make a new one, change an existing one.
 * A new category touches no listing. Changing one in use changes every listing in it on the live site,
 * so that needs the human's go-ahead (confirmLive).
 */
export function registerCategoryTools(server: McpServer, catalog: CatalogService, adminUrl: string) {
  server.registerTool(
    "get_layout_guide",
    {
      description:
        "How a category layout is built: the page parts, the story block types, which listing fields each block can show, and tips. Read it before you create or change a layout.",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    () => run(async () => LAYOUT_GUIDE),
  );

  server.registerTool(
    "list_category_layouts",
    {
      description:
        "The stored layout of every category (or one, with id): its page-part order and what is shown, its story blocks, its action buttons, and the listings that use it. Also lists listings that have no category. Read only. This is the real stored layout, not something inferred from listings.",
      inputSchema: { id: z.string().optional().describe("One category's id. Empty = all.") },
      annotations: { readOnlyHint: true },
    },
    ({ id }) =>
      run(async () => {
        const [{ categories }, { experiences }] = await Promise.all([catalog.getCategories(), catalog.getExperiences()]);
        const rows = categories
          .filter((c) => !id || c.id === id)
          .map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            listingCount: c.listingCount ?? 0,
            review: `${adminUrl}/categories/${c.id}`,
            layout: {
              pageOrder: effectiveSections(c.layout.sections),
              fixed: { gallery: fixedShown(c.layout.sections, "gallery"), more: fixedShown(c.layout.sections, "more"), booking: fixedShown(c.layout.sections, "booking") },
              story: c.layout.story ?? [],
              actionButtons: c.layout.actionButtons ?? "default: call, directions, instagram, share",
            },
            // What a listing in this category should fill in, and what a human has to upload.
            ...fieldsForLayout(c.layout),
            listings: experiences.filter((x) => x.categoryId === c.id).map(slim),
          }));
        if (id && rows.length === 0) throw new Error(`Category ${id} not found`);
        return { categories: rows, ...(id ? {} : { listingsWithoutCategory: experiences.filter((x) => !x.categoryId).map(slim) }) };
      }),
  );

  server.registerTool(
    "check_listing_layout",
    {
      description:
        "For a listing in a category: which of the fields its category's layout reads are still empty. Use it after you create or edit a listing to see what is left to fill. Photos can't be filled in chat, so they come back separately for a human to upload.",
      inputSchema: { id: z.string().describe("Listing id.") },
      annotations: { readOnlyHint: true },
    },
    ({ id }) =>
      run(async () => {
        const row = await catalog.getAdminExperienceById(id);
        const categoryId = (row as { categoryId?: string | null }).categoryId ?? null;
        const { categories } = await catalog.getCategories();
        const category = categories.find((c) => c.id === categoryId);
        if (!category) return { listing: { id: row.id, title: row.title }, category: null, note: "This listing has no category, so there is no layout to check. Put it in one with update_listing (categoryId)." };
        const { fields, uploads } = fieldsForLayout(category.layout);
        // Switches and defaults are not gaps: they have a sensible value already.
        const optional = new Set(["content.taxes", "content.format", "content.walkIn", "content.bookVia", "content.bookLabel", "content.barText", "content.barNote", "content.links.book", "policy.showFinalTermsNote"]);
        const missing = fields.filter((f) => !optional.has(f) && !isFilled(row, f));
        const noPhotos: Record<string, boolean> = { "carousel photos": row.photos.length === 0, "menu pages": row.menuPages.length === 0, "story photos": !row.content?.storyPhotos?.length };
        return {
          listing: { id: row.id, title: row.title },
          category: { id: category.id, name: category.name },
          missing,
          photosToUpload: uploads.filter((u) => noPhotos[u]),
          review: `${adminUrl}/listings/${row.id}`,
          note: missing.length ? "Fill what you can from the brief with update_listing. Don't invent facts." : "Every field this layout reads has something in it.",
        };
      }),
  );

  server.registerTool(
    "create_category",
    {
      description:
        "Create a new category (page layout). It starts with no listings, so nothing live changes. Read get_layout_guide first. Put a listing in it with update_listing (categoryId). Leave `sections` out for the default part order.",
      inputSchema: { name: z.string().describe("e.g. 'Water sports'."), slug: z.string().optional().describe("Lowercase, hyphens. Empty = made from the name."), ...layoutInput },
    },
    ({ name, slug, sections, story, actionButtons }) =>
      run(async () => {
        const made = await catalog.addCategory({ name, slug, layout: defined({ sections, story, actionButtons }) });
        return { id: made.id, name: made.name, slug: made.slug, review: `${adminUrl}/categories/${made.id}`, note: "New category, no listings yet. Use update_listing with categoryId to put a listing in it." };
      }),
  );

  server.registerTool(
    "update_category_layout",
    {
      description:
        "Change a category's name, slug or layout. Send only the layout parts that change (sections, story, actionButtons); each one you send REPLACES the stored one, so read list_category_layouts first and send the full list. If listings use the category, this changes all of them on the live site: tell the user how many, get their go-ahead, then pass confirmLive true.",
      inputSchema: {
        id: z.string().describe("Category id from list_category_layouts."),
        name: z.string().optional(),
        slug: z.string().optional(),
        ...layoutInput,
        confirmLive: z.boolean().optional().describe("true only after the user agreed to change a category that listings use."),
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
    },
    ({ id, name, slug, sections, story, actionButtons, confirmLive }) =>
      run(async () => {
        const { categories } = await catalog.getCategories();
        const now = categories.find((c) => c.id === id);
        if (!now) throw new Error(`Category ${id} not found`);
        const changesLayout = sections !== undefined || story !== undefined || actionButtons !== undefined;
        const used = now.listingCount ?? 0;
        if (changesLayout && used > 0 && confirmLive !== true) {
          throw new Error(`${now.name} is used by ${used} listing${used === 1 ? "" : "s"}. Changing its layout changes ${used === 1 ? "it" : "all of them"} on the live site. Tell the user, and if they agree call again with confirmLive true.`);
        }
        const layout = changesLayout ? { ...now.layout, ...defined({ sections, story, actionButtons }) } : undefined;
        const saved = await catalog.patchCategory(id, defined({ name, slug, layout }));
        return { id: saved.id, name: saved.name, slug: saved.slug, review: `${adminUrl}/categories/${saved.id}`, listingCount: used };
      }),
  );
}
