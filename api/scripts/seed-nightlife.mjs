/**
 * Upserts nightlife shortlist: RAEETH, The Loft, JUNA, Hideaway.
 * Usage: node scripts/seed-nightlife.mjs
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
    id: "11111111-1111-4111-8111-111111111301",
    business_name: "RAEETH",
    person_name: "Abhijit",
    phone_e164: "+919619399117",
    instagram_handle: "raeeth.goa",
    verified: false,
    languages: ["English"],
  },
  {
    id: "11111111-1111-4111-8111-111111111302",
    business_name: "The Loft",
    person_name: "Reservations team",
    phone_e164: "+918080542393",
    instagram_handle: "theloftatanamiva",
    verified: false,
    languages: [],
  },
  {
    id: "11111111-1111-4111-8111-111111111303",
    business_name: "JUNA",
    person_name: "Reservations team",
    phone_e164: "+919226853614",
    instagram_handle: "juna.goa",
    verified: false,
    languages: [],
  },
  {
    id: "11111111-1111-4111-8111-111111111304",
    business_name: "Hideaway",
    person_name: "Reservations team",
    phone_e164: "+918605219351",
    instagram_handle: "hideaway.goa",
    verified: false,
    languages: [],
  },
];

const experiences = [
  {
    id: "22222222-2222-4222-8222-222222222401",
    slug: "raeeth",
    title: "RAEETH",
    status: "published",
    host_id: hosts[0].id,
    verdict: "Dinner first. Then let the techno take over.",
    about:
      "Start with dinner, then follow the shift after 9 PM as techno takes over. RAEETH brings a castle-like setting, a main floor and a separate VIP room to Vagator. Come on a weekend if you want to catch its busier party atmosphere.",
    duration_minutes: 240,
    group_size_max: 20,
    group_size_label:
      "Come as a couple, with friends or on your own; entry rules depend on the night.",
    place_name: "RAEETH, Vagator",
    place_neighborhood: "Vagator",
    place_lat: 15.5975,
    place_lng: 73.7448,
    price_from_inr: 3000,
    price_paid_to: "paid to the venue",
    schedule: {
      days: "Nightly; quieter weekdays possible",
      timeSlot:
        "Opens 7 PM. Dining: 7–9 PM. Party starts after 9 PM. Closing around 4 AM (quieter weekdays sometimes ~3:30 AM).",
      bestTime: "Thursday–Sunday after 9 PM, especially weekends.",
      ageGroup: "Entry rules depend on the night.",
      minPeople: "1",
    },
    policy: {
      summary: "Entry and cover rules change by hour and guest type.",
      booking: [
        "Thursday events use the VIP room; Friday and Saturday events use the main floor.",
        "Sunday’s setup depends on the artist and programme.",
        "Book via the venue’s bookings link when you can.",
      ],
      cancellation: [],
    },
    content: {
      format: "venue",
      taxes: "inclusive",
      aka: "Raeeth Goa; R A È É T H",
      priceNarrative:
        "Weekday rates: Couples ₹3,000 (9–10 PM) / ₹5,000 (10–11 PM). Women free until 10 PM, ₹2,000 after. Stags ₹5,000. After 11 PM, couples’ pricing includes separate entry and cover portions.",
      priceUnit: "Entry / cover by guest type and time.",
      meetingPoint:
        "RAEETH, Ozran Beach Road, opposite Vagator Football Ground, Vagator, Goa.",
      phones: ["+91 96193 99117", "+91 91122 12355", "+91 91122 12366"],
      hostRole: "Abhijit: manager / reservations contact",
      faqs: [
        { q: "What music?", a: "Techno, with no Bollywood." },
        { q: "When does the party start?", a: "After 9 PM." },
        { q: "Can I film?", a: "Videography needs venue permission." },
      ],
      whatsappLabel: "WhatsApp",
      bookLabel: "Bookings",
      instagramLabel: "Instagram",
      menuLabel: "Menu",
      mapsLabel: "Map",
      sourceCategory: "Nightlife",
    },
    published_at: new Date().toISOString(),
    tags: [
      "Techno",
      "Nightclub",
      "Dining",
      "VIP Room",
      "Castle-inspired Interiors",
      "Weekend Parties",
    ],
  },
  {
    id: "22222222-2222-4222-8222-222222222402",
    slug: "the-loft-at-anamiva",
    title: "The Loft at Ānamiva",
    status: "published",
    host_id: hosts[1].id,
    verdict: "Come for the artist. Find your spot on the dancefloor.",
    about:
      "At The Loft, the music is the reason to make the trip. Set into Anjuna’s hills, its indoor room brings dancers close to the sound and the artists behind it. Choose a Friday or Saturday lineup that speaks to you; other days are for dining.",
    duration_minutes: 240,
    group_size_max: 20,
    group_size_label: "Come solo, as a couple or with friends.",
    place_name: "The Loft, Anjuna",
    place_neighborhood: "Anjuna",
    place_lat: 15.5758,
    place_lng: 73.7402,
    price_from_inr: 1000,
    price_paid_to: "paid to the venue",
    schedule: {
      days: "Events on Friday and Saturday. Dining on other days.",
      timeSlot: "Friday and Saturday events start at 9 PM.",
      bestTime: "Friday or Saturday night. Choose your visit around the lineup.",
      ageGroup: "Bring accepted age/identity proof.",
      minPeople: "1",
    },
    policy: {
      summary: "₹1,000 entry on Fridays and Saturdays.",
      booking: [
        "Walk-ins are welcome.",
        "Events run on Fridays and Saturdays; other days are dining only.",
        "Bring your ticket and accepted age/identity proof.",
      ],
      cancellation: [],
    },
    content: {
      format: "venue",
      taxes: "inclusive",
      aka: "The Loft Goa; The Loft at moyo Ānamiva; BudXLoft / Budxloft.",
      priceNarrative: "₹1,000 entry on Fridays and Saturdays.",
      priceUnit: "Entry fee.",
      meetingPoint: "The Loft at Ānamiva, Gaonwadi, Anjuna. House #1259/2 & 1259/3.",
      phones: ["+91 80805 42393"],
      faqs: [
        { q: "Which nights have events?", a: "Friday and Saturday." },
        { q: "Can I walk in?", a: "Yes." },
        { q: "What happens on other days?", a: "Dining only." },
      ],
      bookLabel: "Tickets",
      instagramLabel: "Instagram",
      menuLabel: "Menu",
      mapsLabel: "Map",
      sourceCategory: "Nightlife",
    },
    published_at: new Date().toISOString(),
    tags: [
      "Underground Electronic",
      "House",
      "Techno",
      "Disco",
      "Afro",
      "Indoor Club",
      "Anjuna",
      "Cocktails",
    ],
  },
  {
    id: "22222222-2222-4222-8222-222222222403",
    slug: "juna",
    title: "JUNA",
    status: "published",
    host_id: hosts[2].id,
    verdict: "Start in the courtyard. Follow the music into the Sound Room.",
    about:
      "Begin with a drink under the trees, then follow the music inside. JUNA pairs a courtyard bar in an old Goan bungalow with a separate Sound Room built for listening and dancing. Come with friends or make your own evening around the lineup.",
    duration_minutes: 240,
    group_size_max: 20,
    group_size_label:
      "Come with friends, as a couple, or to meet people. Stag entry is not available.",
    place_name: "JUNA, Anjuna",
    place_neighborhood: "Anjuna",
    place_lat: 15.5821,
    place_lng: 73.7415,
    price_from_inr: 700,
    price_paid_to: "paid to the venue",
    schedule: {
      days: "Closed Tuesday.",
      timeSlot: "Weekdays: 7 PM–2 AM. Weekends: 7 PM–3:30 AM.",
      bestTime: "Dinner from 7 PM, then into the Sound Room for the night’s lineup.",
      ageGroup: "21+",
      minPeople: "1",
    },
    policy: {
      summary: "Entry fee is not redeemable. Stag entry is not available.",
      booking: [
        "Stag entry is not available.",
        "Entry: ₹700; ₹900 after 1 AM.",
        "Food and drinks are charged separately.",
      ],
      cancellation: [],
    },
    content: {
      format: "venue",
      taxes: "inclusive",
      aka: "JUNA Sound Room",
      priceNarrative: "Entry: ₹700; ₹900 after 1 AM. This is an entry fee, not a redeemable cover.",
      priceUnit: "Entry only. Food and drinks are charged separately.",
      meetingPoint: "JUNA, 1108/1, Kutchem Bhat, Anjuna, Goa 403509.",
      phones: ["+91 92268 53614"],
      faqs: [
        { q: "Minimum age?", a: "21+." },
        { q: "Is the entry fee redeemable?", a: "No." },
        { q: "Stag entry?", a: "Not available." },
        { q: "Closed day?", a: "Tuesday." },
      ],
      bookLabel: "Tickets",
      instagramLabel: "Instagram",
      menuLabel: "Food menu",
      mapsLabel: "Map search",
      sourceCategory: "Nightlife",
    },
    published_at: new Date().toISOString(),
    tags: [
      "Listening Bar",
      "Sound Room",
      "Electronic Music",
      "Cocktails",
      "Anjuna",
    ],
  },
  {
    id: "22222222-2222-4222-8222-222222222404",
    slug: "hideaway",
    title: "Hideaway",
    status: "published",
    host_id: hosts[3].id,
    verdict: "A Vagator night out with a cover — call ahead if you want in.",
    about:
      "Hideaway Cafe and Bar on Ozran Beach Road in Vagator. Walk in with cover or call ahead. Live music on Wednesday and Saturday; Tuesday is off.",
    duration_minutes: 180,
    group_size_max: 20,
    group_size_label: "Come solo, as a couple or with friends.",
    place_name: "Hideaway",
    place_neighborhood: "Vagator",
    place_lat: 15.5962,
    place_lng: 73.7455,
    price_from_inr: 500,
    price_paid_to: "paid to the venue",
    schedule: {
      days: "Tuesdays off.",
      timeSlot: "7 PM–1 AM.",
      bestTime: "Wednesday or Saturday for live music.",
      ageGroup: "18+",
      minPeople: "1",
    },
    policy: {
      summary: "₹500 cover charge. Wednesday and Saturday live music.",
      booking: [
        "Walk in with cover charge or call.",
        "₹500 cover charge; Wednesday and Saturday live music.",
      ],
      cancellation: [],
    },
    content: {
      format: "venue",
      taxes: "inclusive",
      aka: "Hideaway Cafe and Bar",
      priceNarrative: "Average cost for two: ₹1,900. Cover about ₹500.",
      priceUnit: "Cover plus food and drinks.",
      meetingPoint:
        "House 622, Ozran Beach Road, Coutinho Vaddo, Vagator, Anjuna, Goa 403509",
      phones: ["+91 86052 19351"],
      faqs: [],
      whatsappLabel: "86052 19351",
      bookLabel: "Walk in w cover charge or call",
      instagramLabel: "Hideaway",
      mapsLabel: "Hideaway Cafe and Bar",
      sourceCategory: "Nightlife",
      note: "Sheet row was thin — fill photos and FAQs when you have them.",
    },
    published_at: new Date().toISOString(),
    tags: ["Nightlife", "Vagator", "Live Music", "Cover Charge"],
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
console.log("Seeded nightlife:", data);
