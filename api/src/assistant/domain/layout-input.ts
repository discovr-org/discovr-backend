import { z } from "zod";

/**
 * What an AI client may send when it builds a category's page layout. Mirrors the admin's layout editor
 * (`discovr-admin/.../categories/utils/layout.ts`): keep the two in step. Each block names the listing
 * field it shows (`source`), so a listing only fills in its content.
 */
export const PARTS = ["title", "info", "verdict", "actions", "about", "menu", "policy", "host", "reviews"] as const;
/** Parts that can also sit inside the story as a block. About is the story itself. */
export const STORY_PARTS = ["title", "info", "verdict", "actions", "menu", "policy", "host", "reviews"] as const;
export const FIXED = ["gallery", "more", "booking"] as const;
export const ACTION_BUTTONS = ["call", "directions", "instagram", "whatsapp", "website", "share"] as const;

export const TEXT_SOURCES = ["title", "about", "verdict", "pitch", "healthAdvisory", "additionalInfo", "fitnessLevel", "instructorRatio", "ageGroup", "bestTime", "priceNarrative", "termsDetail"] as const;
export const LINES_SOURCES = ["included", "notIncluded", "carry", "knowBeforeYouGo"] as const;
export const PHOTO_SOURCES = ["storyPhotos.0", "storyPhotos.1", "storyPhotos.2", "storyPhotos.3", "storyPhotos.4", "storyPhotos.5"] as const;

const text = z.enum(TEXT_SOURCES);
const lines = z.enum(LINES_SOURCES);
const when = z.enum([...TEXT_SOURCES, ...LINES_SOURCES, "faqs", "steps", "packages"]);

const flags = {
  size: z.enum(["full", "half"]).optional().describe("half: two half blocks in a row sit side by side."),
  show: z.boolean().optional().describe("false hides the block."),
  when: when.optional().describe("Show the block only if the listing has this field filled."),
  space: z.enum(["none", "large"]).optional().describe("Space above: none sticks to the block above."),
  hide: z.enum(["mobile", "desktop"]).optional().describe("Hide on phones or on desktop."),
};

export const layoutBlock = z.discriminatedUnion("type", [
  z.object({ type: z.literal("heading"), level: z.enum(["section", "small"]), text: z.string().optional().describe("Fixed text, the same on every listing."), source: text.optional().describe("Or the listing field it shows."), ...flags }),
  z.object({ type: z.literal("line"), ...flags }),
  z.object({ type: z.literal("text"), label: z.string().optional().describe("Small bold label above."), text: z.string().optional(), source: text.optional(), ...flags }),
  z.object({ type: z.literal("quote"), text: z.string().optional(), source: text.optional(), ...flags }),
  z.object({ type: z.literal("checklist"), title: z.string(), source: lines, ...flags }),
  z.object({ type: z.literal("forNotFor"), columns: z.array(z.object({ title: z.string(), tone: z.enum(["included", "bring"]).describe("included = ticks, bring = crosses."), source: lines })).min(1).max(2), ...flags }),
  z.object({ type: z.literal("callout"), tone: z.enum(["heads_up", "tip"]), title: z.string(), text: z.string().optional(), source: text.optional(), ...flags }),
  z.object({ type: z.literal("faq"), source: z.literal("faqs").optional(), ...flags }),
  z.object({ type: z.literal("steps"), source: z.literal("steps").optional(), ...flags }),
  z.object({ type: z.literal("stats"), tiles: z.array(z.object({ label: z.string(), source: text })).min(1).max(4), ...flags }),
  z.object({ type: z.literal("packages"), title: z.string().optional(), source: z.literal("packages").optional(), ...flags }),
  z.object({ type: z.literal("photo"), source: z.enum(PHOTO_SOURCES), ...flags }),
  z.object({ type: z.literal("part"), id: z.enum(STORY_PARTS).describe("A page part drawn here, inside the story, instead of in its usual place."), ...flags }),
]);

const section = z.object({
  id: z.enum([...PARTS, ...FIXED]),
  show: z.boolean().optional().describe("false hides the part."),
  space: z.enum(["none", "large"]).optional(),
  hide: z.enum(["mobile", "desktop"]).optional(),
});

export const layoutInput = {
  sections: z
    .array(section)
    .optional()
    .describe("Order and visibility of the page parts, top to bottom. About is where the story sits. Parts left out keep their default place. gallery, more and booking are fixed in place; they can only be hidden."),
  story: z.array(layoutBlock).optional().describe("The story, in order: the blocks drawn at the About part. A block can be a page part (type part) to put it in the middle of the story."),
  actionButtons: z.array(z.enum(ACTION_BUTTONS)).optional().describe("Buttons in the Action buttons row, in order. Leave out for the usual four (call, directions, instagram, share)."),
};

export const DEFAULT_PART_ORDER = PARTS;

/** The page's part order as a guest sees it: the saved order with any missing part put back after the part before it. */
export function effectiveSections(saved: unknown): Array<{ id: string; show: boolean; space?: string; hide?: string }> {
  const list = Array.isArray(saved) ? (saved as Array<{ id?: unknown; show?: unknown; space?: unknown; hide?: unknown }>) : [];
  const known = new Set<string>(PARTS);
  const out = list
    .filter((s, i) => typeof s.id === "string" && known.has(s.id) && list.findIndex((x) => x.id === s.id) === i)
    .map((s) => ({ id: s.id as string, show: s.show !== false, ...(typeof s.space === "string" ? { space: s.space } : {}), ...(typeof s.hide === "string" ? { hide: s.hide } : {}) }));
  for (const id of PARTS) {
    if (out.some((s) => s.id === id)) continue;
    const prev = PARTS[PARTS.indexOf(id) - 1];
    out.splice(prev ? out.findIndex((s) => s.id === prev) + 1 : 0, 0, { id, show: true });
  }
  return out;
}

/** Whether a fixed part (gallery, more in Goa, booking bar) is shown. */
export const fixedShown = (saved: unknown, id: (typeof FIXED)[number]): boolean =>
  !(Array.isArray(saved) ? (saved as Array<{ id?: unknown; show?: unknown }>) : []).some((s) => s.id === id && s.show === false);

export const LAYOUT_GUIDE = {
  howItWorks:
    "A category is a page layout shared by many listings. The layout says which blocks the page has and in what order; each block shows a field from the listing, and hides itself when the listing has nothing for it. Listings only fill in content.",
  page: "Top to bottom: photo gallery (fixed), then the parts in `sections` order (title, info, verdict, actions, about, menu, policy, host, reviews), then More in Goa and the booking bar (fixed). The story (`story` blocks) is drawn where `about` sits. A block of type part moves a page part into the middle of the story.",
  blocks: {
    heading: "A heading. level section (big) or small. Text from `source` (a text field) or fixed `text`.",
    line: "A thin divider.",
    text: "A paragraph from a text source (or fixed text), with an optional bold `label`.",
    quote: "A pull quote from a text source, usually pitch.",
    checklist: "A titled checklist from a lines source (carry, included...).",
    forNotFor: "Up to two columns of ticks/crosses, each from a lines source (usually included and notIncluded).",
    callout: "A coloured box: tone heads_up (amber) or tip (blue), a title, and a text source.",
    faq: "The listing's FAQs as open/close rows. source faqs.",
    steps: "The listing's process steps. source steps.",
    stats: "Up to four small tiles, each a label and a text source (like ageGroup).",
    packages: "The listing's price rows. source packages.",
    photo: "One story photo from storyPhotos.0 to storyPhotos.5.",
    part: "A page part (title, info, verdict, actions, menu, policy, host, reviews) drawn here inside the story.",
  },
  sources: {
    text: TEXT_SOURCES,
    lines: LINES_SOURCES,
    faqs: "faqs",
    steps: "steps",
    packages: "packages",
    photos: PHOTO_SOURCES,
  },
  flags: "Every block can also take: size (full|half), show (false hides), when (show only if this field is filled), space (none|large), hide (mobile|desktop).",
  tips: [
    "Start from an existing layout: read list_category_layouts and copy the one closest to what the user wants.",
    "A story usually starts with a heading from `title`, a divider, a quote from `pitch`, a text block from `about`, then facts, then FAQs.",
    "Use `when` on headings and dividers that belong to a section, so an empty section leaves no stray heading.",
    "Sources must match the block: text blocks take text sources, checklists take lines sources, photos take storyPhotos.N.",
  ],
} as const;
