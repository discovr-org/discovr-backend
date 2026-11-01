/**
 * Upserts Coco Padel (Assagao).
 * Usage: node scripts/seed-coco-padel.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
try {
  const raw = readFileSync(resolve(here, "../../.env"), "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let v = m[2] ?? "";
    if (v.endsWith('"')) v = v.slice(0, -1);
    if (!process.env[m[1]]) process.env[m[1]] = v;
  }
} catch {
  /* ok */
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY");
  process.exit(1);
}

const sb = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const host = {
  id: "11111111-1111-4111-8111-111111111901",
  business_name: "Coco Padel",
  person_name: "Reservations team",
  phone_e164: "+919867949343",
  verified: false,
  languages: [],
};

const experience = {
  id: "22222222-2222-4222-8222-222222223001",
  slug: "coco-padel",
  title: "Coco Padel",
  status: "published",
  host_id: host.id,
  verdict:
    "Court from ₹1,000 for half an hour — bring non-marking shoes; racquets and balls cost extra.",
  about:
    "Padel courts in Bouta Waddo, Assagao. Book via Hudle or call. Amenities include ball boy, cafe, parking, sound system, warm-up area, rental equipment, drinking water, seating, washrooms, flood lights, showers and wifi. Arrive 15 minutes before your slot. Don’t play barefoot.",
  duration_minutes: 30,
  group_size_max: 4,
  group_size_label:
    "2–4 players. If solo, call — they might help you join a group. Larger groups: call the hosts.",
  place_name: "Coco Padel",
  place_neighborhood: "Assagao",
  place_lat: 15.5948,
  place_lng: 73.7662,
  price_from_inr: 1000,
  price_paid_to: "paid via Hudle / venue",
  schedule: {
    days: "All days",
    timeSlot: "7 AM–10:30 PM (last slot)",
    bestTime: "Book ahead for peak evening slots.",
    ageGroup: "All ages",
    minPeople: "2",
    difficulty: "easy",
  },
  policy: {
    summary: "Zero cancellation policy at the venue.",
    booking: [
      "Book on Hudle or call.",
      "₹1,000 for half an hour + ₹24 Hudle platform fee.",
      "Racquets available on rent (₹50 each); balls available for purchase.",
      "Please arrive 15 mins before your slot time.",
      "No food, drinks or intoxicants on the court premise.",
      "If booking is cancelled from their end, no refund — dates will be moved.",
    ],
    cancellation: [
      "The venue has a zero cancellation policy.",
      "If the venue cancels, dates are moved; no refund.",
    ],
  },
  content: {
    priceNarrative: "₹1,000 for half an hour + ₹24 platform fee (Hudle)",
    priceUnit: "Court hire for 2–4 players, half hour minimum.",
    meetingPoint: "Bouta Waddo, Assagao, Goa 403507",
    phones: ["+91 98679 49343"],
    carry: [
      "Your own racquets and balls (or rent/buy on site)",
      "Non-marking shoes",
      "Refreshments and hydration",
      "Hand towels",
    ],
    amenities: [
      "Ball boy",
      "Cafe",
      "Parking",
      "Sound system",
      "Warm-up area",
      "Rental equipment",
      "Drinking water",
      "Seating area",
      "Washroom",
      "Flood lights",
      "Showers",
      "Wifi",
    ],
    faqs: [
      {
        q: "How do I book?",
        a: "Hudle website or call / WhatsApp.",
      },
      {
        q: "What’s included?",
        a: "Court and amenities. Racquets and balls are not included.",
      },
      {
        q: "Can I go alone?",
        a: "Call them — they might help you join a group.",
      },
    ],
    whatsappLabel: "Coco Padel Booking",
    bookLabel: "Hudle Website, Call",
    instagramLabel: "Coco Padel Insta",
    mapsLabel: "Coco Padel - Assagao",
    sourceCategory: "Other",
    note: "Sheet about/one-liner empty — verdict from price and kit notes.",
  },
  published_at: new Date().toISOString(),
  tags: ["Padel", "Assagao", "Court", "Sport"],
};

function assertOk(label, error) {
  if (error) {
    console.error(label, error);
    process.exit(1);
  }
}

const { error: hostErr } = await sb.from("hosts").upsert(host, {
  onConflict: "id",
});
assertOk("hosts", hostErr);

const { tags, ...row } = experience;
const { error } = await sb.from("experiences").upsert(row, {
  onConflict: "id",
});
assertOk("experience", error);

await sb.from("experience_tags").delete().eq("experience_id", row.id);
const { error: tagErr } = await sb.from("experience_tags").insert(
  tags.map((tag) => ({ experience_id: row.id, tag })),
);
assertOk("tags", tagErr);

await sb.from("experience_inclusions").delete().eq("experience_id", row.id);
const { error: incErr } = await sb.from("experience_inclusions").insert([
  {
    experience_id: row.id,
    included: true,
    title: "Court and venue amenities",
    detail:
      "Ball boy, cafe, parking, flood lights, showers, wifi and more.",
    sort_order: 0,
  },
  {
    experience_id: row.id,
    included: false,
    title: "Not included: racquets and balls",
    detail: "Rent racquets (~₹50) or bring your own; balls for purchase.",
    sort_order: 1,
  },
]);
assertOk("inclusions", incErr);

const sectionId = "33333333-3333-4333-8333-333333333309";
const { error: secErr } = await sb.from("feed_sections").upsert(
  {
    id: sectionId,
    slug: "padel",
    title: "Padel",
    density: "portrait",
    sort_order: 80,
    active: true,
  },
  { onConflict: "id" },
);
assertOk("feed_sections", secErr);

await sb.from("feed_section_items").delete().eq("section_id", sectionId);
const { error: itemsErr } = await sb.from("feed_section_items").insert({
  section_id: sectionId,
  experience_id: row.id,
  sort_order: 0,
});
assertOk("feed_section_items", itemsErr);

const { data } = await sb
  .from("experiences")
  .select("slug,title,price_from_inr,verdict")
  .eq("slug", "coco-padel");
console.log("Seeded:", data);
