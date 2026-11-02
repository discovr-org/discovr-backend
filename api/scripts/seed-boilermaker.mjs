/**
 * Upserts Boilermaker (cocktails & nightlife).
 * Usage: node scripts/seed-boilermaker.mjs
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
  id: "11111111-1111-4111-8111-111111111601",
  business_name: "Boilermaker",
  person_name: "Reservations team",
  phone_e164: "+919226049851",
  verified: false,
  languages: [],
};

const experience = {
  id: "22222222-2222-4222-8222-222222222701",
  slug: "boilermaker",
  title: "Boilermaker",
  status: "published",
  host_id: host.id,
  verdict: "A beer, a shot, and a good reason to settle in.",
  about:
    "Pull up a stool at this open-air Siolim bar and start with its namesake: a beer and a shot. Boilermaker puts craft beer, inventive cocktails and Goan bar bites into a relaxed, social setting. Book ahead. The tables are hard to come by.",
  duration_minutes: 150,
  group_size_max: 12,
  group_size_label: "Come solo, as a couple or with friends. Book ahead for a table.",
  place_name: "Boilermaker, Siolim",
  place_neighborhood: "Siolim",
  place_lat: 15.6198,
  place_lng: 73.7692,
  price_from_inr: 3200,
  price_paid_to: "paid to the venue",
  schedule: {
    days: "Daily evenings.",
    timeSlot: "Opens at 6 PM.",
    bestTime: "Early evening for a quieter start, before the room fills up.",
    ageGroup: "21+",
    minPeople: "1",
  },
  policy: {
    summary: "Book ahead — tables fill quickly.",
    booking: [
      "Book ahead: tables fill quickly.",
      "Boilermaker is ranked No. 8 in Asia’s 50 Best Bars 2026 and named Best Bar in India 2026.",
    ],
    cancellation: [],
  },
  content: {
    aka: "Boiler Maker",
    priceNarrative: "₹3,200",
    priceUnit: "Approximate spend for two.",
    meetingPoint:
      "Boilermaker, opposite Vailanka Wine Store, Siolim. Church Vaddi, en route to Thalassa, Siolim, Goa 403517.",
    phones: ["+91 92260 49851"],
    faqs: [
      { q: "Should I book?", a: "Yes. Tables can be hard to get." },
      {
        q: "What should I order?",
        a: "Start with a boilermaker, then explore the cocktails and bar bites.",
      },
    ],
    bookLabel: "Book",
    instagramLabel: "Instagram",
    menuLabel: "Menu",
    mapsLabel: "Map",
    sourceCategory: "Cocktails & Nightlife",
  },
  published_at: new Date().toISOString(),
  tags: [
    "Cocktails",
    "Craft Beer",
    "Open Air",
    "Siolim",
    "Goan Bar Bites",
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

const { data } = await sb
  .from("experiences")
  .select("slug,title,price_from_inr")
  .eq("slug", "boilermaker");
console.log("Seeded:", data);
