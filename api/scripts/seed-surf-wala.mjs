/**
 * Upserts Surf Wala (Arambol surfing).
 * Usage: node scripts/seed-surf-wala.mjs
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
  id: "11111111-1111-4111-8111-111111112001",
  business_name: "Surf Wala",
  person_name: "Reservations team",
  phone_e164: "+919146118015",
  verified: false,
  languages: [],
};

const experience = {
  id: "22222222-2222-4222-8222-222222223101",
  slug: "surf-wala",
  title: "Surf Wala",
  status: "published",
  host_id: host.id,
  verdict:
    "Ninety minutes at Arambol — twenty on land, the rest in the water. Boards and guidance included.",
  about:
    "Surf lessons at Bag Dando Road near Surf Club, Arambol. Two daily slots: 8 AM and 10 AM. About 90 minutes total — roughly 20 minutes on land, the rest in the water. Bring a swimsuit (leggings in swimsuit material work), sunscreen, a change of clothes, hydration and towels. For health concerns like asthma, check with your doctor and confirm with the host.",
  duration_minutes: 90,
  group_size_max: 4,
  group_size_label:
    "Solo, group or couple. For a group larger than 4, call them.",
  place_name: "Surf Wala",
  place_neighborhood: "Arambol",
  place_lat: 15.6867,
  place_lng: 73.7045,
  price_from_inr: 3000,
  price_paid_to: "paid to the host",
  schedule: {
    days: "Every day",
    timeSlot: "8 AM and 10 AM (2 slots)",
    bestTime: "Morning — pick the 8 AM or 10 AM slot.",
    ageGroup: "5+ (different session — call host to confirm)",
    minPeople: "1",
    difficulty: "easy–moderate",
  },
  policy: {
    summary: "Arrive at your booked slot. Advance may be non-refundable.",
    booking: [
      "WhatsApp or call to book.",
      "Arrive at the particular time slot.",
      "50% advance might be required to book; booking amount is non-refundable.",
      "Call them for swimsuits and questions on additional facilities.",
    ],
    cancellation: [
      "Booking advance is typically non-refundable.",
    ],
  },
  content: {
    priceNarrative: "₹3,000 including taxes",
    priceUnit: "Per person / session.",
    meetingPoint: "Bag Dando Road, near Surf Club, Arambol, Goa 403524",
    phones: ["+91 91461 18015"],
    carry: [
      "Swimsuit",
      "Sunscreen",
      "Extra pair of clothes",
      "Hydration and refreshments",
      "Towels",
    ],
    faqs: [
      {
        q: "How long is the session?",
        a: "About 90 minutes — ~20 mins on land, the rest in the water.",
      },
      {
        q: "What’s included?",
        a: "Boards, leashes, guidance and surfing outfits.",
      },
      {
        q: "What’s not included?",
        a: "Refreshments and towels.",
      },
    ],
    whatsappLabel: "Surf Wala Whatsapp",
    bookLabel: "Whatsapp or call",
    instagramLabel: "Surf Wala Website",
    mapsLabel: "Surf Wala",
    sourceCategory: "Water Sports",
    note: "Sheet about/one-liner empty — verdict from duration and kit notes.",
  },
  published_at: new Date().toISOString(),
  tags: ["Surfing", "Arambol", "Water Sports", "Lesson", "Easy–Moderate"],
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
    title: "Boards, leashes, guidance and surfing outfits",
    detail: null,
    sort_order: 0,
  },
  {
    experience_id: row.id,
    included: false,
    title: "Not included: refreshments and towels",
    detail: null,
    sort_order: 1,
  },
]);
assertOk("inclusions", incErr);

const { data } = await sb
  .from("experiences")
  .select("slug,title,price_from_inr,verdict")
  .eq("slug", "surf-wala");
console.log("Seeded:", data);
