/**
 * Upserts Angel Tattoo (Baga / Calangute).
 * Usage: node scripts/seed-angel-tattoo.mjs
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
  id: "11111111-1111-4111-8111-111111111801",
  business_name: "Angel Tattoo",
  person_name: "Sagar Dharoliya",
  phone_e164: "+919960107775",
  verified: false,
  languages: [],
};

const experience = {
  id: "22222222-2222-4222-8222-222222222901",
  slug: "angel-tattoo",
  title: "Angel Tattoo",
  status: "published",
  host_id: host.id,
  verdict:
    "Bring your idea. Base price from ₹2,000 for a small piece — the artist sets the final amount.",
  about:
    "Angel Tattoo Studio opposite Navratna Restaurant on Tito’s Lane, Baga / Calangute. By appointment only. Bring your idea and designs. If you have diabetes or other health issues, tell the artist before you sit.",
  duration_minutes: 60,
  group_size_max: 4,
  group_size_label:
    "Solo, group or couple. Call to confirm for a group of 4+.",
  place_name: "Angel Tattoo Studio",
  place_neighborhood: "Baga, Calangute",
  place_lat: 15.5559,
  place_lng: 73.7516,
  price_from_inr: 2000,
  price_paid_to: "paid to the artist",
  schedule: {
    days: "Monday–Sunday, by appointment only.",
    timeSlot: "10 AM–1:30 AM",
    bestTime: "Book ahead — walk-ins aren’t the plan.",
    ageGroup: "18+",
    minPeople: "1",
  },
  policy: {
    summary:
      "Price varies with design. Base from ₹2,000. Final amount decided by the artist.",
    booking: [
      "Call or WhatsApp to book.",
      "If you have diabetes or other health issues, inform the artist before.",
      "Price will vary depending upon the design and creative artwork. Base price ₹2,000 onwards. Final amount decided by artist.",
    ],
    cancellation: [
      "No cancellation fee, although please inform the host before cancelling.",
    ],
  },
  content: {
    priceNarrative: "₹2,000 (3 inches basic)",
    priceUnit: "From this base; final amount by artist.",
    meetingPoint:
      "Angel Tattoo Opposite Navratna Restaurant, Tito’s Ln, Saunta Vaddo, Baga, Calangute, Goa 403516",
    phones: ["+91 99601 07775"],
    carry: ["Your idea and designs"],
    faqs: [
      {
        q: "How do I book?",
        a: "Call or WhatsApp. By appointment only.",
      },
      {
        q: "What’s included?",
        a: "All tattoo equipment and basic after care.",
      },
      {
        q: "Health concerns?",
        a: "Tell the artist about diabetes or other issues before you sit.",
      },
    ],
    whatsappLabel: "Angel Tattoo Whatsapp",
    bookLabel: "Call, Whatsapp",
    instagramLabel: "Angel Tattoo Studio Insta",
    mapsLabel: "Angel Tattoo Studio",
    sourceCategory: "Other",
    note: "Sheet about/one-liner empty — verdict built from price and booking notes.",
  },
  published_at: new Date().toISOString(),
  tags: ["Tattoo", "Baga", "Calangute", "Studio"],
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
    title: "All tattoo equipment and basic after care",
    detail: null,
    sort_order: 0,
  },
]);
assertOk("inclusions", incErr);

const { data } = await sb
  .from("experiences")
  .select("slug,title,price_from_inr,verdict")
  .eq("slug", "angel-tattoo");
console.log("Seeded:", data);
