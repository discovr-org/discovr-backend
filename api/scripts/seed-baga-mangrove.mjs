/**
 * Upserts Baga Mangrove Kayaking.
 * Usage: node scripts/seed-baga-mangrove.mjs
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
  id: "11111111-1111-4111-8111-111111112201",
  business_name: "Baga Mangrove Kayaking",
  person_name: "Reservations team",
  phone_e164: "+919923259541",
  verified: false,
  languages: [],
};

const experience = {
  id: "22222222-2222-4222-8222-222222223301",
  slug: "baga-mangrove-kayaking",
  title: "Baga Mangrove Kayaking",
  status: "published",
  host_id: host.id,
  verdict:
    "You’ll get wet, learn the basics, then paddle the mangroves on your own — single or double kayaks.",
  about:
    "Mangrove kayaking near Flow Night Club on the Calangute–Baga Road. About 1.5–2 hours. Book by call or WhatsApp in advance (8 AM–7 PM, all days by appointment). Wear light, quick-drying clothes and footwear you don’t mind getting wet. Bring sunscreen, sunglasses and a reusable water bottle. For asthma, pregnancy or other health concerns, check with your doctor and confirm with the host.",
  duration_minutes: 105,
  group_size_max: 10,
  group_size_label: "Solo, group and couple. Max 10.",
  place_name: "Baga Mangrove Kayaking",
  place_neighborhood: "Baga, Mapusa",
  place_lat: 15.5628,
  place_lng: 73.7552,
  price_from_inr: 300,
  price_paid_to: "paid to the host",
  schedule: {
    days: "All days — book via call in advance.",
    timeSlot: "8 AM–7 PM, by appointment",
    bestTime: "Morning or late afternoon when the heat eases.",
    ageGroup: "5+",
    minPeople: "1",
    difficulty: "easy–moderate",
  },
  policy: {
    summary:
      "Half the booking amount is paid in advance and is non-refundable to confirm your slot.",
    booking: [
      "Call or WhatsApp to book.",
      "Wear light, quick-drying clothes and footwear you don’t mind getting wet.",
      "Don’t forget sunscreen, sunglasses, and a reusable water bottle.",
      "Safe with precautions for asthma, pregnancy, etc. — confirm with hosts and doctors.",
    ],
    cancellation: [
      "Advance paid to confirm the slot is non-refundable.",
    ],
  },
  content: {
    priceNarrative: "₹300 including taxes",
    priceUnit: "Per person / session.",
    meetingPoint:
      "Calangute - Baga Rd, near Flow Night Club, Baga, Mapusa, Goa 403509",
    phones: ["+91 99232 59541"],
    carry: ["Extra clothes", "Toiletries"],
    faqs: [
      {
        q: "How long is it?",
        a: "About 1.5–2 hours.",
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
    whatsappLabel: "Whatsapp",
    bookLabel: "Call, Whatsapp",
    instagramLabel: "Baga Mangrove Kayaking",
    mapsLabel: "Baga Mangrove Kayaking",
    sourceCategory: "Water Sports",
    note: "Sheet about/one-liner empty — verdict from the note row.",
  },
  published_at: new Date().toISOString(),
  tags: [
    "Mangrove Kayaking",
    "Water Sports",
    "Baga",
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

const { data } = await sb
  .from("experiences")
  .select("slug,title,price_from_inr,verdict")
  .eq("slug", "baga-mangrove-kayaking");
console.log("Seeded:", data);
