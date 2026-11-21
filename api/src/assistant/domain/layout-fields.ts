/**
 * Which listing fields a category layout reads, named the way the MCP tools take them (`content.pitch`,
 * `schedule.ageGroup`...). Mirrors the admin's sheet (`discovr-admin/.../listings/utils/listingSheet.ts`): keep the two in step.
 * An AI that adds a listing to a category fills these, and `check_listing_layout` reports which are still empty.
 */
import { effectiveSections, fixedShown } from "./layout-input.js";

type Layout = { sections?: unknown; story?: unknown[]; actionButtons?: unknown };
type Block = { type?: string; show?: boolean; id?: string; source?: string; when?: string; columns?: Array<{ source?: string }>; tiles?: Array<{ source?: string }> };

/** Every listing needs these to exist at all. */
const ALWAYS = ["title", "placeName", "placeNeighborhood", "content.links.maps", "priceFromInr"];

const PART_FIELDS: Record<string, string[]> = {
  info: ["priceFromInr", "content.priceNarrative", "content.priceUnit", "content.taxes", "content.format", "content.walkIn", "durationMinutes", "content.durationLabel", "groupSizeMax", "groupSizeLabel", "schedule.days", "schedule.timeSlot", "schedule.altDays", "schedule.altTimeSlot", "schedule.closedDays", "schedule.bestTime", "schedule.ageGroup", "schedule.minPeople", "content.meetingPoint"],
  verdict: ["verdict"],
  actions: ["content.phones", "content.links.instagram", "content.links.whatsapp", "content.links.website", "content.links.maps"],
  about: ["about"],
  menu: ["content.links.menu"],
  policy: ["policy.summary", "policy.booking", "policy.cancellation", "content.termsDetail", "policy.showFinalTermsNote"],
};

const SOURCE_FIELDS: Record<string, string> = {
  title: "title", about: "about", verdict: "verdict", pitch: "content.pitch", healthAdvisory: "content.healthAdvisory", additionalInfo: "content.additionalInfo",
  fitnessLevel: "content.fitnessLevel", instructorRatio: "content.instructorRatio", ageGroup: "schedule.ageGroup", bestTime: "schedule.bestTime",
  priceNarrative: "content.priceNarrative", termsDetail: "content.termsDetail", included: "content.included", notIncluded: "content.notIncluded",
  carry: "content.carry", knowBeforeYouGo: "content.knowBeforeYouGo", faqs: "content.faqs", steps: "content.steps", packages: "content.packages",
};

export type LayoutFields = {
  /** Fields to fill through create_listing_draft / update_listing. */
  fields: string[];
  /** What a human uploads (the AI can't): carousel photos, menu pages, story photos. */
  uploads: string[];
};

export function fieldsForLayout(layout: Layout): LayoutFields {
  const fields = new Set<string>(ALWAYS);
  const uploads = new Set<string>();
  const add = (list: string[] = []) => list.forEach((f) => fields.add(f));
  for (const part of effectiveSections(layout.sections)) {
    if (!part.show) continue;
    add(PART_FIELDS[part.id]);
    if (part.id === "menu") uploads.add("menu pages");
  }
  if (fixedShown(layout.sections, "gallery")) uploads.add("carousel photos");
  if (fixedShown(layout.sections, "booking")) add(["content.bookVia", "content.bookLabel", "content.barText", "content.barNote", "content.links.book"]);
  for (const b of (layout.story ?? []) as Block[]) {
    if (b.show === false) continue;
    if (b.type === "part" && b.id) {
      add(PART_FIELDS[b.id]);
      if (b.id === "menu") uploads.add("menu pages");
    }
    const sources = [b.source, b.when, ...(b.columns ?? []).map((c) => c.source), ...(b.tiles ?? []).map((t) => t.source)];
    if (b.type === "faq") sources.push("faqs");
    if (b.type === "steps") sources.push("steps");
    if (b.type === "packages") sources.push("packages");
    for (const src of sources) {
      if (!src) continue;
      if (src.startsWith("storyPhotos.")) uploads.add("story photos");
      else if (SOURCE_FIELDS[src]) fields.add(SOURCE_FIELDS[src]);
    }
  }
  return { fields: [...fields], uploads: [...uploads] };
}

/** Walks a dotted path on a listing as the admin sees it. Empty = missing, "", [] or nothing. */
export function isFilled(row: unknown, path: string): boolean {
  let v: unknown = row;
  for (const key of path.split(".")) {
    if (v === null || typeof v !== "object") return false;
    v = (v as Record<string, unknown>)[key];
  }
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim() !== "";
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") return Object.keys(v as object).length > 0 && Boolean((v as { url?: unknown }).url ?? true);
  if (typeof v === "number") return v > 0;
  return true; // booleans and the like count as set
}
