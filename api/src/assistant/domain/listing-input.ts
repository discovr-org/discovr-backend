import { z } from "zod";

/**
 * What an AI client may fill in when it drafts a listing.
 * No `status`, no photos: drafts only, text only. Shapes mirror ExperienceCreate / ExperiencePatch.
 */
const day = z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
const link = z.object({ url: z.string().url() });

export const listingBasics = {
  title: z.string().describe("Listing name, e.g. 'Sunset Kayaking at Palolem'."),
  hostId: z.string().describe("Host id from find_hosts or create_host_draft."),
  verdict: z.string().optional().describe("One-line verdict shown on cards. Required before publishing."),
  about: z.string().optional().describe("Main description."),
  placeName: z.string().describe("Venue or meeting place name."),
  placeNeighborhood: z.string().describe("Area, e.g. 'Anjuna'."),
  placeLat: z.number().describe("Latitude. Never guess: ask the user, or read it from a Google Maps link."),
  placeLng: z.number().describe("Longitude. Never guess."),
  priceFromInr: z.number().int().min(0).optional().describe("Lowest price in whole rupees."),
  durationMinutes: z.number().int().positive().optional(),
  groupSizeMax: z.number().int().positive().optional(),
  groupSizeLabel: z.string().optional(),
};

export const listingExtras = {
  tags: z.array(z.string()).optional(),
  schedule: z
    .object({
      timeSlot: z.string().optional().describe("Usual hours, e.g. '8am – 1am'."),
      closedDays: z.array(day).optional(),
      altDays: z.array(day).optional(),
      altTimeSlot: z.string().optional(),
      bestTime: z.string().optional(),
      ageGroup: z.string().optional(),
    })
    .optional(),
  policy: z
    .object({
      summary: z.string(),
      booking: z.array(z.string()),
      cancellation: z.array(z.string()),
    })
    .optional(),
  content: z
    .object({
      format: z.enum(["trip", "venue"]).optional().describe("trip = tour/activity; venue = bar/restaurant."),
      pitch: z.string().optional().describe("Italic one-liner at the top of About."),
      priceUnit: z.string().optional().describe("Short, max 20 chars, e.g. 'per person'."),
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
      bookVia: z.enum(["call", "link"]).optional(),
      links: z
        .object({
          maps: link.optional(),
          book: link.optional(),
          whatsapp: link.optional(),
          instagram: link.optional(),
          menu: link.optional(),
        })
        .optional(),
    })
    .optional(),
};
