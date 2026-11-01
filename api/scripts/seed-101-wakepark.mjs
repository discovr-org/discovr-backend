/**
 * Upserts 101 Wakepark (Arambol wakeboarding).
 * Usage: node scripts/seed-101-wakepark.mjs
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
  id: "11111111-1111-4111-8111-111111112301",
  business_name: "101 Wakepark",
  person_name: "Reservations team",
  phone_e164: "+918446246935",
  verified: false,
  languages: [],
};

const experience = {
  id: "22222222-2222-4222-8222-222222223401",
  slug: "101-wakepark",
  title: "101 Wakepark",
  status: "published",
  host_id: host.id,
  verdict:
    "An hour on the cable — coaching first, then water time. No experience needed; swimmers and non-swimmers welcome.",
  about:
    "Wakeboarding at Om Lake Resort, 101, near the fish market next to the bridge in Arambol. One-hour session: about 30 minutes coaching with an instructor, then 30 minutes on the water. Helmet, life jacket and board rental included. Book by appointment 8 AM–6 PM, all days. Arrive 15 minutes early. For asthma, pregnancy or other health concerns, check with your doctor and confirm with the host.",
  duration_minutes: 60,
  group_size_max: 5,
  group_size_label:
    "Solo costs more; couple less. Call for group discounts. Max 5.",
  place_name: "101 Wakepark",
  place_neighborhood: "Arambol",
  place_lat: 15.6865,
  place_lng: 73.7062,
  price_from_inr: 3250,
  price_paid_to: "paid to the venue",
  schedule: {
    days: "All days — book in advance.",
    timeSlot: "By appointment, 8 AM–6 PM",
    bestTime: "Morning or late afternoon when the park is cooler.",
    ageGroup: "10+ with an adult",
    minPeople: "1",
    difficulty: "moderate",
  },
  policy: {
    summary: "₹500 online payment to book — not refundable.",
    booking: [
      "Book via website or call / WhatsApp.",
      "Arrive 15 mins before your slot.",
      "₹500 payment to be made online, not refundable.",
      "Safe with precautions for asthma, pregnancy, etc. — confirm with hosts and doctors.",
    ],
    cancellation: [
      "Online booking payment (₹500) is not refundable.",
    ],
  },
  content: {
    priceNarrative: "₹3,250 per person; ₹6,000 per couple including person",
    priceUnit: "Per person or couple package.",
    meetingPoint:
      "Wake park Om lake resort, 101, near fish Market, next to bridge, Arambol, Goa 403524",
    phones: ["+91 84462 46935"],
    carry: [
      "Swimwear",
      "Towels",
      "Extra pair of clothes",
      "Toiletries",
      "Sunscreen",
      "Hydration",
    ],
    faqs: [
      {
        q: "What’s in the hour?",
        a: "30 min coaching + 30 min on-water, with helmet, life jacket and board.",
      },
      {
        q: "Do I need experience?",
        a: "No. Swimmers and non-swimmers both welcome.",
      },
      {
        q: "What’s not included?",
        a: "Meals, refreshments, towels and swimwear.",
      },
    ],
    whatsappLabel: "101 Wakepark Whatsapp Number",
    bookLabel: "Website, Call",
    instagramLabel: "101 Wakepark",
    mapsLabel: "101 Wake Park",
    sourceCategory: "Water Sports",
    note: "Sheet about/one-liner empty — verdict from session structure.",
  },
  published_at: new Date().toISOString(),
  tags: ["Wakeboarding", "Arambol", "Water Sports", "Cable", "Moderate"],
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
    title: "30 min coaching + 30 min on-water",
    detail: "Helmet, life jacket and board rental included.",
    detail_tone: "positive",
    sort_order: 0,
  },
  {
    experience_id: row.id,
    included: false,
    title: "Not included: meals, refreshments, towels, swimwear",
    detail: null,
    sort_order: 1,
  },
]);
assertOk("inclusions", incErr);

const sectionId = "33333333-3333-4333-8333-333333333313";
const { error: secErr } = await sb.from("feed_sections").upsert(
  {
    id: sectionId,
    slug: "wakeboarding",
    title: "Wakeboarding",
    density: "portrait",
    sort_order: 95,
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
  .eq("slug", "101-wakepark");
console.log("Seeded:", data);
