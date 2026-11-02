/**
 * Upserts cocktails shortlist: Drop Dead Sexy, MTW Bar & Toasties.
 * Usage: node scripts/seed-cocktails.mjs
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
    id: "11111111-1111-4111-8111-111111111501",
    business_name: "Drop Dead Sexy",
    person_name: "Reservations team",
    phone_e164: "+919156145044",
    verified: false,
    languages: [],
  },
  {
    id: "11111111-1111-4111-8111-111111111502",
    business_name: "MTW Bar & Toasties",
    person_name: "Reservations team",
    phone_e164: "unknown",
    verified: false,
    languages: [],
  },
];

const experiences = [
  {
    id: "22222222-2222-4222-8222-222222222601",
    slug: "drop-dead-sexy",
    title: "Drop Dead Sexy",
    status: "published",
    host_id: hosts[0].id,
    verdict: "The room has eyes. Your cocktail has a story.",
    about:
      "At this little Assagao bar, mechanical eyes watch the room and hand-shaped lamps move overhead. Drop Dead Sexy turns a drink into an encounter with art, with a seasonal cocktail menu built around one ingredient. Settle into the intimate space and ask what’s being poured this season.",
    duration_minutes: 120,
    group_size_max: 8,
    group_size_label: "An intimate setting for a date or a small group.",
    place_name: "Drop Dead Sexy, Assagao",
    place_neighborhood: "Assagao",
    place_lat: 15.5945,
    place_lng: 73.7658,
    price_from_inr: 2800,
    price_paid_to: "paid to the venue",
    schedule: {
      days: "Daily",
      timeSlot: "Opens at 9 PM.",
      bestTime: "From 9 PM. Enquire ahead for a table.",
      ageGroup: "Adults; alcohol service applies.",
      minPeople: "1",
    },
    policy: {
      summary: "Small room — enquire ahead for groups.",
      booking: [
        "It’s a small room, so enquire ahead if you’re coming with a group.",
        "Use the booking listing when you can.",
      ],
      cancellation: [],
    },
    content: {
      priceNarrative: "₹2,800",
      priceUnit: "Approximate spend for two.",
      meetingPoint:
        "Drop Dead Sexy, opposite Sublime, Assagao. 544/2, Mapusa–Chapora Road, Bouta Waddo, Assagao, Goa 403507.",
      phones: ["+91 91561 45044"],
      faqs: [
        { q: "Where is it?", a: "Opposite Sublime in Assagao." },
        { q: "When does it open?", a: "9 PM." },
        {
          q: "What should I order?",
          a: "Ask about the current cocktail ingredient and season.",
        },
      ],
      bookLabel: "Booking listing",
      instagramLabel: "Instagram",
      mapsLabel: "Map",
      sourceCategory: "Cocktails",
    },
    published_at: new Date().toISOString(),
    tags: ["Cocktails", "Art Bar", "Microbar", "Assagao", "Late Night"],
  },
  {
    id: "22222222-2222-4222-8222-222222222602",
    slug: "mtw-bar-and-toasties",
    title: "MTW Bar & Toasties",
    status: "published",
    host_id: hosts[1].id,
    verdict: "Panaji toasties and cocktails — walk in after seven.",
    about:
      "MTW Bar & Toasties near Mahalaxmi Temple in Panaji. Walk in Monday to Saturday from 7 PM to 1 AM. Details still thin — fill the about and menu when you have them.",
    duration_minutes: 120,
    group_size_max: 12,
    group_size_label: "Solo, couples and small groups.",
    place_name: "MTW Bar & Toasties",
    place_neighborhood: "Panaji",
    place_lat: 15.4909,
    place_lng: 73.8278,
    price_from_inr: 2000,
    price_paid_to: "paid to the venue",
    schedule: {
      days: "Monday–Saturday",
      timeSlot: "7 PM–1 AM",
      bestTime: "Evening",
      ageGroup: "18+",
      minPeople: "1",
    },
    policy: {
      summary: "Walk in.",
      booking: ["Walk in."],
      cancellation: [],
    },
    content: {
      priceNarrative: "₹2,000 for two",
      priceUnit: "Approximate spend for two.",
      meetingPoint:
        "Dr Dada Vaidya Rd, near Mahalaxmi Temple, Altinho, Panaji, Goa 403001",
      phones: [],
      faqs: [],
      bookLabel: "Walk in",
      instagramLabel: "MTW",
      mapsLabel: "MTW - Bar & Toasties",
      sourceCategory: "Cocktails",
      note: "Sheet row was thin — phone unknown; host phone placeholder. Fill later.",
    },
    published_at: new Date().toISOString(),
    tags: ["Cocktails", "Toasties", "Panaji", "Bar"],
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
console.log("Seeded cocktails:", data);
