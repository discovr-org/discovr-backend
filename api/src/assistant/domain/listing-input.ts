import { z } from "zod";

/**
 * What an AI client may fill in when it drafts a listing.
 * No `status`, no photos: drafts only, text only. Shapes mirror ExperienceCreate / ExperiencePatch.
 */
const day = z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
const link = z.object({ url: z.string().url() });

export const listingBasics = {
  title: z.string().describe("Listing name, e.g. 'Sunset Kayaking at Palolem'."),
  hostId: z.string().optional().describe("Host id from find_hosts or create_host_draft. Leave out for a place with no host (a beach, a viewpoint)."),
  categoryId: z.string().optional().describe("Category (page layout) id from list_categories. The listing then fills in that category's layout."),
  verdict: z.string().optional().describe("One-line verdict shown on cards. Required before publishing."),
  about: z.string().optional().describe("Main description."),
  placeName: z.string().describe("Venue or meeting place name."),
  placeNeighborhood: z.string().describe("Area, e.g. 'Anjuna'."),
  placeLat: z.number().optional().describe("Latitude. Never guess. Leave out if you give content.links.maps (a long Google Maps link with the pin in it); otherwise ask the user or call find_place."),
  placeLng: z.number().optional().describe("Longitude. Never guess. Leave out when content.links.maps carries it."),
  priceFromInr: z.number().int().min(0).optional().describe("Lowest price in whole rupees."),
  durationMinutes: z.number().int().positive().optional(),
  groupSizeMax: z.number().int().positive().optional(),
  groupSizeLabel: z.string().optional(),
};

export const listingExtras = {
  tags: z.array(z.string()).optional(),
  schedule: z
    .object({
      days: z.string().optional().describe("Days it runs, e.g. 'Daily'."),
      timeSlot: z.string().optional().describe("Usual hours, e.g. '8am – 1am'."),
      closedDays: z.array(day).optional(),
      altDays: z.array(day).optional(),
      altTimeSlot: z.string().optional(),
      bestTime: z.string().optional(),
      ageGroup: z.string().optional(),
      minPeople: z.string().optional(),
    })
    .optional(),
  policy: z
    .object({
      summary: z.string(),
      booking: z.array(z.string()),
      cancellation: z.array(z.string()),
      showFinalTermsNote: z.boolean().optional(),
    })
    .optional(),
  content: z
    .object({
      format: z.enum(["trip", "venue"]).optional().describe("trip = tour/activity; venue = bar/restaurant."),
      pitch: z.string().optional().describe("Italic one-liner at the top of About."),
      priceUnit: z.string().optional().describe("Short, max 20 chars, e.g. 'per person'."),
      taxes: z.enum(["inclusive", "extra"]).optional().describe("Whether the price includes taxes. Default inclusive."),
      walkIn: z.boolean().optional().describe("Venues only: no booking needed."),
      durationLabel: z.string().optional().describe("e.g. '1 hr 30 mins'."),
      aka: z.string().optional().describe("Also known as."),
      priceNarrative: z.string().optional(),
      meetingPoint: z.string().optional(),
      additionalInfo: z.string().optional(),
      termsDetail: z.string().optional(),
      fitnessLevel: z.string().optional(),
      instructorRatio: z.string().optional(),
      healthAdvisory: z.string().optional(),
      carry: z.array(z.string()).optional().describe("Things to bring."),
      knowBeforeYouGo: z.array(z.string()).optional(),
      included: z.array(z.string()).optional(),
      notIncluded: z.array(z.string()).optional(),
      faqs: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
      bookVia: z
        .enum(["call", "link", "custom"])
        .optional()
        .describe('call = guest calls (default). link = opens links.book as "Book on <host>". custom = opens links.book with bookLabel as the button text.'),
      bookLabel: z.string().optional().describe("Button text when bookVia is custom, e.g. 'Reserve a table'."),
      barText: z.string().optional().describe("Replaces the left text of the booking bar. Empty = the price."),
      barNote: z.string().optional().describe("Small line under it. Empty = the unit, like 'per person'."),
      actionButtons: z
        .array(z.enum(["call", "directions", "instagram", "whatsapp", "website", "share"]))
        .optional()
        .describe("Buttons in the Action buttons row, in order. Leave out for the usual four. A button with nothing to open is left out on the page."),
      phones: z.array(z.string()).optional().describe("Numbers guests can call. Used for Call when the listing has no host."),
      steps: z
        .array(z.object({ title: z.string(), caption: z.string().optional() }))
        .optional()
        .describe("Process steps, in order. Only for categories whose layout shows steps."),
      packages: z
        .array(z.object({ name: z.string(), price: z.string().describe("Rupees as text, like '3000'."), detail: z.string().optional() }))
        .optional()
        .describe("Price rows. Only for categories whose layout shows them."),
      links: z
        .object({
          maps: link.optional(),
          book: link.optional(),
          whatsapp: link.optional(),
          instagram: link.optional(),
          website: link.optional(),
          menu: link.optional(),
        })
        .optional(),
    })
    .optional(),
};

/** What the AI sent for `content`, as the catalog stores it: process steps get their numbers. */
export function toContent<T extends { steps?: Array<{ title: string; caption?: string }> }>(content: T) {
  const { steps, ...rest } = content;
  return steps ? { ...rest, steps: steps.map((s, i) => ({ marker: `${i + 1}.`, ...s })) } : rest;
}
