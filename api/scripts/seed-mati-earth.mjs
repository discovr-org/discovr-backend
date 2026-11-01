/**
 * Upserts Mati Earth Studio (Mandrem pottery).
 * Usage: node scripts/seed-mati-earth.mjs
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
  id: "11111111-1111-4111-8111-111111112101",
  business_name: "Mati Earth Studio",
  person_name: "Reservations team",
  phone_e164: "+918468890544",
  verified: false,
  languages: [],
};

const experience = {
  id: "22222222-2222-4222-8222-222222223201",
  slug: "mati-earth-studio",
  title: "Mati Earth Studio",
  status: "published",
  host_id: host.id,
  verdict:
    "Two hours with clay and basic tools in Mandrem — no wheel. Wear clothes you don’t mind getting dirty.",
  about:
    "Hand-building pottery workshop at Mati Earth Studio in Junaswada, Mandrem. No potter’s wheel — clay and basic tools only. Sessions run about 2 hours at 11 AM or 3 PM (closed Tuesday). Studio open roughly 10:30 AM–5 PM. Casual phone photos are fine; no professional shoots during the workshop. Firing is ₹300 per piece plus shipping if you want to keep it.",
  duration_minutes: 120,
  group_size_max: 10,
  group_size_label: "Solo, group or couple. Max 10.",
  place_name: "Mati Earth Studio",
  place_neighborhood: "Mandrem",
  place_lat: 15.6572,
  place_lng: 73.7248,
  price_from_inr: 1200,
  price_paid_to: "paid to the studio",
  schedule: {
    days: "Tuesday closed. Workshops other days.",
    timeSlot: "11 AM or 3 PM workshops; studio open ~10:30 AM–5 PM.",
    bestTime: "Pick the morning or afternoon workshop slot.",
    ageGroup: "8+",
    minPeople: "1",
    difficulty: "easy",
  },
  policy: {
    summary: "Arrive on time — group session; late joiners miss the restart.",
    booking: [
      "Book via website or call / WhatsApp.",
      "Please arrive on time — the teacher cannot re-start instructions if someone joins late.",
      "Casual phone photography is fine; no professional photo/video shoots during the workshop.",
      "Firing is ₹300 per piece, plus shipping charges.",
    ],
    cancellation: [
      "More than 15 days before: full refund.",
      "Between 15 and 5 days before: 50% refund.",
      "Less than 5 days before: no refund (100% charged).",
    ],
  },
  content: {
    priceNarrative: "₹1,200 including taxes",
    priceUnit: "Per person / workshop.",
    meetingPoint: "159/B, Junaswada, Mandrem, Goa 403527",
    phones: ["+91 84688 90544"],
    carry: [
      "Comfortable clothes you don’t mind getting clay on (preferably no whites or lights)",
    ],
    faqs: [
      {
        q: "Is there a potter’s wheel?",
        a: "No. Only clay and basic tools in this workshop.",
      },
      {
        q: "Can I keep my piece?",
        a: "Firing is ₹300 per piece plus shipping — optional, more durable.",
      },
      {
        q: "When are workshops?",
        a: "11 AM or 3 PM; closed Tuesday.",
      },
    ],
    whatsappLabel: "Mati Pottery Studio Whatsapp",
    bookLabel: "Website, Call",
    instagramLabel: "Mati Earth Booking",
    mapsLabel: "Mati Earth Studio",
    sourceCategory: "Other",
    note: "Sheet about/one-liner empty — verdict from workshop format notes.",
  },
  published_at: new Date().toISOString(),
  tags: ["Pottery", "Mandrem", "Workshop", "Clay", "Easy"],
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
    title: "All clay, tools and guidance",
    detail: "Firing and shipping are extra if you want to keep the piece.",
    sort_order: 0,
  },
]);
assertOk("inclusions", incErr);

const sectionId = "33333333-3333-4333-8333-333333333311";
const { error: secErr } = await sb.from("feed_sections").upsert(
  {
    id: sectionId,
    slug: "pottery",
    title: "Pottery",
    density: "portrait",
    sort_order: 100,
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
  .eq("slug", "mati-earth-studio");
console.log("Seeded:", data);
