/**
 * Upserts Palolem Beach Kayaking (Deva's Kayaks).
 * Usage: node scripts/seed-palolem-kayaking.mjs
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
  id: "11111111-1111-4111-8111-111111111701",
  business_name: "Deva's Kayaks",
  person_name: "Deva Pagi",
  phone_e164: "+919923391887",
  verified: false,
  languages: [],
};

const experience = {
  id: "22222222-2222-4222-8222-222222222801",
  slug: "palolem-beach-kayaking",
  title: "Palolem Beach Kayaking",
  status: "published",
  host_id: host.id,
  verdict:
    "You’ll get wet, learn the basics, then paddle out on your own — single or double kayaks.",
  about:
    "Coastal kayaking at Palolem with Deva’s Kayaks. You get kayaks, life jackets, instructor training, plus photos and videos. Book by call or WhatsApp in advance. Bring extra clothes and toiletries — you will get wet.",
  duration_minutes: 60,
  group_size_max: 10,
  group_size_label:
    "Solo, group and couple. No group discounts. More than 10? Call the host to confirm slots.",
  place_name: "Palolem Beach",
  place_neighborhood: "Palolem, Canacona",
  place_lat: 15.0101,
  place_lng: 74.0232,
  price_from_inr: 200,
  price_paid_to: "paid to the host",
  schedule: {
    days: "All days — book via call in advance.",
    timeSlot: "6 AM–6 PM",
    bestTime: "Morning or late afternoon when the sun is kinder.",
    ageGroup: "10+",
    minPeople: "1",
    difficulty: "easy–moderate",
  },
  policy: {
    summary:
      "Half the booking amount is paid in advance and is non-refundable to confirm your slot.",
    booking: [
      "Call or WhatsApp to book.",
      "Safe with precautions for asthma, pregnancy, etc. — confirm with hosts and doctors.",
      "Half amount of booking to be paid in advance; that amount is non-refundable to confirm your slot.",
    ],
    cancellation: [
      "Advance paid to confirm the slot is non-refundable.",
    ],
  },
  content: {
    priceNarrative: "₹200 inclusive of all taxes",
    priceUnit: "Per person / per session (1 hour).",
    meetingPoint: "Palolem, Canacona, Goa 403702",
    phones: ["+91 99233 91887", "+91 82082 49794"],
    carry: ["Extra clothes", "Toiletries"],
    faqs: [
      {
        q: "How do I book?",
        a: "Call or WhatsApp Deva’s Kayaks in advance.",
      },
      {
        q: "What’s included?",
        a: "Kayaks, life jackets, instructor training, photos and videos.",
      },
      {
        q: "What’s not included?",
        a: "Meals and refreshments.",
      },
    ],
    whatsappLabel: "Deva's Kayaks Whatsapp",
    bookLabel: "Call, Whatsapp",
    instagramLabel: "Deva's Kayaks Palolem Insta",
    mapsLabel: "Deva's Kayaks",
    sourceCategory: "Water Sports",
    note: "Sheet about/one-liner were empty — verdict taken from the note row.",
  },
  published_at: new Date().toISOString(),
  tags: [
    "Coastal Kayaking",
    "Water Sports",
    "Palolem",
    "Kayak",
    "Easy–Moderate",
  ],
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
    title: "Kayaks, life jackets and instructor training",
    detail: "Photos and videos included.",
    sort_order: 0,
  },
  {
    experience_id: row.id,
    included: false,
    title: "Not included: meals and refreshments",
    detail: null,
    sort_order: 1,
  },
]);
assertOk("inclusions", incErr);

const sectionId = "33333333-3333-4333-8333-333333333307";
const { error: secErr } = await sb.from("feed_sections").upsert(
  {
    id: sectionId,
    slug: "coastal-kayaking",
    title: "Coastal Kayaking",
    density: "portrait",
    sort_order: 60,
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
  .eq("slug", "palolem-beach-kayaking");
console.log("Seeded:", data);
