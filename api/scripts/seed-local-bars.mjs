/**
 * Upserts local bars: Cajy Bar, Pablos.
 * Usage: node scripts/seed-local-bars.mjs
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

const hosts = [
  {
    id: "11111111-1111-4111-8111-111111111401",
    business_name: "Cajy Bar",
    person_name: "Eligio and Evelyn Fernandes",
    phone_e164: "+919370437069",
    verified: false,
    languages: [],
  },
  {
    id: "11111111-1111-4111-8111-111111111402",
    business_name: "Pablos",
    person_name: "Reservations team",
    phone_e164: "+919890345291",
    verified: false,
    languages: [],
  },
];

const experiences = [
  {
    id: "22222222-2222-4222-8222-222222222501",
    slug: "cajy-bar",
    title: "Cajy Bar",
    status: "published",
    host_id: hosts[0].id,
    verdict: "A family kept their tavern alive. Now pull up a chair.",
    about:
      "Cajy is a family tavern that found its way back to life with Eligio, Evelyn and their mother, Philomena. Pull up a chair in Arpora for cashew feni, Goan cooking and the easy conversation of a neighbourhood bar. The food is part of the family story.",
    duration_minutes: 120,
    group_size_max: 12,
    group_size_label: "Solo, couples and groups.",
    place_name: "Cajy Bar, Arpora",
    place_neighborhood: "Arpora",
    place_lat: 15.5698,
    place_lng: 73.7624,
    price_from_inr: 1000,
    price_paid_to: "paid to the venue",
    schedule: {
      days: "Daily",
      timeSlot: "Evening into late",
      bestTime: "Come in the evening and leave time for dinner.",
      ageGroup: "All ages for dining; alcohol rules apply.",
      minPeople: "1",
    },
    policy: {
      summary: "Self-service bar.",
      booking: ["Walk in or call.", "Self-service bar."],
      cancellation: [],
    },
    content: {
      aka: "Cajy Taverna",
      priceNarrative: "Approx. ₹1,000–₹2,000",
      priceUnit: "For two; your food and drinks determine the bill.",
      meetingPoint: "Cajy Bar, Mainath Bhatti, Arpora. No. 95, Mello Rosa Resort Road, Mainath Bhatti, Arpora, Goa 403516.",
      phones: ["+91 93704 37069"],
      hostNote: "Goan cooking by Philomena.",
      faqs: [
        {
          q: "What should I try?",
          a: "Cashew feni, tongue roast, admaas or stew.",
        },
        { q: "How do I visit?", a: "Walk in or call ahead." },
      ],
      bookLabel: "Walk in or call",
      instagramLabel: "Instagram",
      mapsLabel: "Map",
      sourceCategory: "Local Bar",
    },
    published_at: new Date().toISOString(),
    tags: ["Local Bar", "Goan Food", "Feni", "Family Run", "Arpora"],
  },
  {
    id: "22222222-2222-4222-8222-222222222502",
    slug: "pablos",
    title: "Pablos",
    status: "published",
    host_id: hosts[1].id,
    verdict: "Assagao’s neighbourhood bar — walk in, stay for a drink.",
    about:
      "Pablos in Assagao. Try the curd rice cocktail; Pastel de nata is a Portuguese egg custard tart cocktail. Walk in or call. Mondays off.",
    duration_minutes: 120,
    group_size_max: 12,
    group_size_label: "Solo, couples and groups.",
    place_name: "Pablos",
    place_neighborhood: "Assagao",
    place_lat: 15.5912,
    place_lng: 73.7588,
    price_from_inr: 1000,
    price_paid_to: "paid to the venue",
    schedule: {
      days: "Mondays off.",
      timeSlot: "5 PM–1 AM",
      bestTime: "Evening",
      ageGroup: "18+",
      minPeople: "1",
    },
    policy: {
      summary: "Walk in or call.",
      booking: [
        "Walk in or call.",
        "Try the curd rice cocktail. Pastel de nata is a Portuguese egg custard tart cocktail.",
      ],
      cancellation: [],
    },
    content: {
      priceNarrative: "₹1,000 for two",
      priceUnit: "For two; food and drinks vary.",
      meetingPoint:
        "Badem Junction, Off Assagaon Badem Rd, Vagator, Assagao, Goa 403509",
      phones: ["+91 98903 45291"],
      faqs: [],
      whatsappLabel: "98903 45291",
      bookLabel: "Walk in or call",
      instagramLabel: "PABLOS",
      mapsLabel: "Pablos",
      sourceCategory: "Local Bar",
      note: "Sheet row was thin — fill about/verdict polish and photos when you have them.",
    },
    published_at: new Date().toISOString(),
    tags: ["Local Bar", "Assagao", "Cocktails"],
  },
];

function assertOk(label, error) {
  if (error) {
    console.error(label, error);
    process.exit(1);
  }
}

const { error: hostErr } = await sb.from("hosts").upsert(hosts, {
  onConflict: "id",
});
assertOk("hosts", hostErr);

for (const exp of experiences) {
  const { tags, ...row } = exp;
  const { error } = await sb.from("experiences").upsert(row, {
    onConflict: "id",
  });
  assertOk(`experience ${row.slug}`, error);

  await sb.from("experience_tags").delete().eq("experience_id", row.id);
  const { error: tagErr } = await sb.from("experience_tags").insert(
    tags.map((tag) => ({ experience_id: row.id, tag })),
  );
  assertOk(`tags ${row.slug}`, tagErr);
}

const { data } = await sb
  .from("experiences")
  .select("slug,title,price_from_inr")
  .in(
    "slug",
    experiences.map((e) => e.slug),
  );
console.log("Seeded local bars:", data);
