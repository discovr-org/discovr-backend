/**
 * Upserts the four Goan fish thali listings with full sheet content + real links.
 * Usage: npm run seed:fish-thali
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
    id: "11111111-1111-4111-8111-111111111201",
    business_name: "Bombil",
    person_name: "Reservations team",
    phone_e164: "+919823291413",
    instagram_handle: "bombilgoa",
    verified: false,
    languages: [],
  },
  {
    id: "11111111-1111-4111-8111-111111111202",
    business_name: "Vinayak Family Restaurant",
    person_name: "Reservations team",
    phone_e164: "+919049380518",
    verified: false,
    languages: [],
  },
  {
    id: "11111111-1111-4111-8111-111111111203",
    business_name: "Kokni Kanteen",
    person_name: "Reservations team",
    phone_e164: "+919579275664",
    instagram_handle: "koknikanteengoa",
    verified: false,
    languages: [],
  },
  {
    id: "11111111-1111-4111-8111-111111111204",
    business_name: "Ritz Classic Panjim",
    person_name: "Reservations team",
    phone_e164: "+918322426417",
    verified: false,
    languages: [],
  },
];

const sharedIncluded = [
  "Seating and table service. Food and drinks charged separately.",
];
const sharedNotIncluded = [
  "Food, drinks, taxes and any booking extras",
];

const experiences = [
  {
    id: "22222222-2222-4222-8222-222222222301",
    slug: "bombil",
    title: "Bombil",
    status: "published",
    host_id: hosts[0].id,
    verdict: "Jo missed his old family haunts. So he built one.",
    about:
      "Jo missed the small Goan eateries he used to visit with his father, so he created Bombil. Come for a homestyle thali built around the day’s fish, local curries and house pickles. Get there early for lunch. The tables fill quickly.",
    duration_minutes: 90,
    group_size_max: 8,
    group_size_label: "Come solo, as a couple, with friends or with family.",
    place_name: "Bombil",
    place_neighborhood: "Campal, Panaji",
    place_lat: 15.4967,
    place_lng: 73.8196,
    price_from_inr: 500,
    price_ask: false,
    price_paid_to: "paid to the venue",
    schedule: {
      days: "Daily",
      timeSlot: "Lunch from noon; dinner from 7:30 PM.",
      bestTime: "Go when lunch opens, around noon, to get ahead of the queue.",
      ageGroup: "All ages. Alcohol service is subject to age restrictions.",
      minPeople: "1 for normal dining",
      durationLabel: "Allow 1–2 hours.",
    },
    policy: {
      summary: "Walk-in seating. Fish availability changes daily.",
      booking: [
        "Expect a lunch queue. Fish choices change with the catch.",
        "Seating is walk-in.",
      ],
      cancellation: [],
    },
    content: {
      aka: "",
      locationLabel:
        "Shops 20 and 23, Gurudutta Apartments, opposite Don Bosco School, Campal, Panaji",
      priceNarrative: "Approx. ₹500–₹1,000",
      priceUnit: "For two; your fish selection affects the bill.",
      meetingPoint:
        "Bombil, Shops 20 and 23, Gurudutta Apartments, opposite Don Bosco School, Campal, Panaji",
      droppingPoint: "",
      durationLabel: "Allow 1–2 hours.",
      additionalInfo:
        "Expect a lunch queue. Fish choices change with the catch.",
      termsDetail: "Walk-in seating. Fish availability changes daily.",
      whatToCarry: "",
      included: sharedIncluded,
      notIncluded: sharedNotIncluded,
      phones: ["+91 98232 91413"],
      languages: [],
      maxPeople: "",
      distance: "",
      difficulty: "",
      tagsOnDisplay: [
        "Goan Fish Thali",
        "Homestyle",
        "Seafood",
        "Local Favourite",
      ],
      faqs: [
        {
          q: "What should I order?",
          a: "A fish thali with the day’s available catch.",
        },
        { q: "Can I reserve?", a: "Seating is walk-in." },
        { q: "When should I arrive?", a: "Around noon for lunch." },
      ],
      links: {
        maps: {
          label: "Map",
          url: "https://www.google.com/maps/search/?api=1&query=Bombil%20Shops%2020%20and%2023%2C%20Gurudutta%20Apartments%2C%20opposite%20Don%20Bosco%20School%2C%20Campal%2C%20Panaji%20Goa",
        },
        menu: {
          label: "Menu",
          url: "https://www.district.in/dining/goa/bombil-restaurant-panaji",
        },
      },
    },
    published_at: new Date().toISOString(),
    tags: ["Goan Fish Thali", "Homestyle", "Seafood", "Local Favourite"],
  },
  {
    id: "22222222-2222-4222-8222-222222222302",
    slug: "vinayak-family-restaurant",
    title: "Vinayak Family Restaurant",
    status: "published",
    host_id: hosts[1].id,
    verdict: "A family kitchen and a thali that keeps Assagao coming back.",
    about:
      "A family kitchen, a view of the paddy fields and a thali that brings people back to Assagao. Vinayak keeps things simple: Goan seafood, local flavours and generous plates. Arrive before the lunch rush and take your time with the meal.",
    duration_minutes: 90,
    group_size_max: 8,
    group_size_label: "Come solo, as a couple, with friends or with family.",
    place_name: "Vinayak Family Restaurant",
    place_neighborhood: "Assagao, North Goa",
    place_lat: 15.5937,
    place_lng: 73.7647,
    price_from_inr: 390,
    price_ask: false,
    price_paid_to: "paid to the venue",
    schedule: {
      days: "Monday–Wednesday and Friday–Sunday. Closed Thursday.",
      timeSlot: "Lunch: around noon–4:30 PM. Dinner: around 7–11 PM.",
      bestTime: "Before 12:30 PM for lunch.",
      ageGroup: "All ages. Alcohol service is subject to age restrictions.",
      minPeople: "1 for normal dining",
      durationLabel: "Allow 1–2 hours.",
    },
    policy: {
      summary: "Fish choices and prices depend on the day’s catch.",
      booking: [
        "Seating is open-sided and can feel warm at lunch.",
        "Arrive before 12:30 PM for a better chance of beating the queue.",
      ],
      cancellation: [],
    },
    content: {
      aka: "",
      locationLabel: "House No 278, Socol Vaddo, Assagao, North Goa 403507",
      priceNarrative: "Approx. ₹390–₹500 for selected fish thalis.",
      priceUnit: "Per thali; the fish and daily menu affect the price.",
      meetingPoint:
        "Vinayak Family Restaurant, House No 278, Socol Vaddo, Assagao, North Goa 403507",
      droppingPoint: "",
      durationLabel: "Allow 1–2 hours.",
      additionalInfo:
        "Seating is open-sided and can feel warm at lunch. Arrive before 12:30 PM for a better chance of beating the queue.",
      termsDetail: "Fish choices and prices depend on the day’s catch.",
      whatToCarry: "",
      included: sharedIncluded,
      notIncluded: sharedNotIncluded,
      phones: ["+91 90493 80518"],
      languages: [],
      maxPeople: "",
      distance: "",
      difficulty: "",
      tagsOnDisplay: [
        "Goan Fish Thali",
        "Family Run",
        "Seafood",
        "Value",
      ],
      faqs: [
        { q: "What should I try?", a: "A fish thali or prawns rawa fry." },
        { q: "Closed day?", a: "Thursday." },
        { q: "Best arrival time?", a: "Before 12:30 PM for lunch." },
      ],
      links: {
        maps: {
          label: "Map",
          url: "https://www.google.com/maps/search/?api=1&query=Vinayak%20Family%20Restaurant%20House%20No%20278%2C%20Socol%20Vaddo%2C%20Assagao%2C%20North%20Goa%20403507%20Goa",
        },
      },
    },
    published_at: new Date().toISOString(),
    tags: ["Goan Fish Thali", "Family Run", "Seafood", "Value"],
  },
  {
    id: "22222222-2222-4222-8222-222222222303",
    slug: "kokni-kanteen",
    title: "Kokni Kanteen",
    status: "published",
    host_id: hosts[2].id,
    verdict: "Old Panaji has been coming here for fish curry since 1972.",
    about:
      "Since 1972, Kokni Kanteen has been serving the flavours people associate with home in Goa. Step into its old Panaji setting for a fish thali, local curries and seafood sides. Come early for lunch, before the queue starts building.",
    duration_minutes: 90,
    group_size_max: 8,
    group_size_label: "Come solo, as a couple, with friends or with family.",
    place_name: "Kokni Kanteen",
    place_neighborhood: "Panaji",
    place_lat: 15.4909,
    place_lng: 73.8278,
    price_from_inr: 1300,
    price_ask: false,
    price_paid_to: "paid to the venue",
    schedule: {
      days: "Daily",
      timeSlot: "Lunch and dinner.",
      bestTime: "Early lunch, around 12:30 PM.",
      ageGroup: "All ages. Alcohol service is subject to age restrictions.",
      minPeople: "1 for normal dining",
      durationLabel: "Allow 1–2 hours.",
    },
    policy: {
      summary: "Your booking platform’s terms apply.",
      booking: [
        "You’ll find it near Mahalaxmi Temple.",
        "Lunch gets busy, so arrive early.",
      ],
      cancellation: [],
    },
    content: {
      aka: "",
      locationLabel:
        "Dr Dada Vaidya Road, near Mahalaxmi Temple, Panaji 403001",
      priceNarrative: "Approx. ₹1,300",
      priceUnit: "For two.",
      meetingPoint:
        "Kokni Kanteen, Dr Dada Vaidya Road, near Mahalaxmi Temple, Panaji 403001",
      droppingPoint: "",
      durationLabel: "Allow 1–2 hours.",
      additionalInfo:
        "You’ll find it near Mahalaxmi Temple. Lunch gets busy, so arrive early.",
      termsDetail: "Your booking platform’s terms apply.",
      whatToCarry: "",
      included: sharedIncluded,
      notIncluded: sharedNotIncluded,
      phones: ["+91 95792 75664"],
      languages: [],
      maxPeople: "",
      distance: "",
      difficulty: "",
      tagsOnDisplay: [
        "Konkani",
        "Heritage",
        "Fish Thali",
        "Traditional",
        "Panaji",
      ],
      faqs: [
        {
          q: "What should I try?",
          a: "Fish thali, prawn-stuffed papad and serradura.",
        },
        { q: "Where is it?", a: "Near Mahalaxmi Temple in Panaji." },
        { q: "When should I go?", a: "Early for lunch." },
      ],
      links: {
        maps: {
          label: "Map",
          url: "https://www.google.com/maps/search/?api=1&query=Kokni%20Kanteen%20Dr%20Dada%20Vaidya%20Road%2C%20near%20Mahalaxmi%20Temple%2C%20Panaji%20403001%20Goa",
        },
        book: {
          label: "Book",
          url: "https://www.district.in/dining/goa/kokni-kanteen-panaji",
        },
        instagram: {
          label: "Instagram",
          url: "https://www.instagram.com/koknikanteengoa/",
        },
      },
    },
    published_at: new Date().toISOString(),
    tags: ["Konkani", "Heritage", "Fish Thali", "Traditional", "Panaji"],
  },
  {
    id: "22222222-2222-4222-8222-222222222304",
    slug: "ritz-classic-panjim",
    title: "Ritz Classic Panjim",
    status: "published",
    host_id: hosts[3].id,
    verdict: "The fish-thali lunch Panaji keeps coming back to.",
    about:
      "Some lunches become a habit. At Ritz Classic, that habit is a Goan fish thali filled with curries, seafood sides and familiar flavours. Head to the 18th June Road branch in Panaji for a meal that has kept generations of diners returning.",
    duration_minutes: 90,
    group_size_max: 8,
    group_size_label: "Come solo, as a couple, with friends or with family.",
    place_name: "Ritz Classic Panjim",
    place_neighborhood: "Panaji",
    place_lat: 15.4989,
    place_lng: 73.8272,
    price_from_inr: 362,
    price_ask: false,
    price_paid_to: "paid to the venue",
    schedule: {
      days: "Daily",
      timeSlot: "11 AM–8:30 PM",
      bestTime: "Come for lunch, before the busiest period.",
      ageGroup: "All ages. Alcohol service is subject to age restrictions.",
      minPeople: "1 for normal dining",
      durationLabel: "Allow 1–2 hours.",
    },
    policy: {
      summary: "Venue menu and seating terms apply.",
      booking: [
        "This listing is for the 18th June Road branch, not Patto or Gymkhana.",
      ],
      cancellation: [],
    },
    content: {
      aka: "",
      locationLabel:
        "First Floor, Wagle Vision Building, 18th June Road, Panaji 403001",
      priceNarrative: "₹362 for a fish thali.",
      priceUnit: "Per thali.",
      meetingPoint:
        "Ritz Classic Panjim, First Floor, Wagle Vision Building, 18th June Road, Panaji 403001",
      droppingPoint: "",
      durationLabel: "Allow 1–2 hours.",
      additionalInfo:
        "This listing is for the 18th June Road branch, not Patto or Gymkhana.",
      termsDetail: "Venue menu and seating terms apply.",
      whatToCarry: "",
      included: sharedIncluded,
      notIncluded: sharedNotIncluded,
      phones: ["+91 832 242 6417"],
      languages: [],
      maxPeople: "",
      distance: "",
      difficulty: "",
      tagsOnDisplay: [
        "Goan Fish Thali",
        "Heritage",
        "Seafood",
        "Panaji Classic",
      ],
      faqs: [
        { q: "Which branch?", a: "18th June Road, Panaji." },
        { q: "What should I order?", a: "The fish thali." },
      ],
      links: {
        maps: {
          label: "Map",
          url: "https://www.google.com/maps/search/?api=1&query=Ritz%20Classic%20Panjim%20First%20Floor%2C%20Wagle%20Vision%20Building%2C%2018th%20June%20Road%2C%20Panaji%20403001%20Goa",
        },
      },
    },
    published_at: new Date().toISOString(),
    tags: ["Goan Fish Thali", "Heritage", "Seafood", "Panaji Classic"],
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

  await sb.from("experience_inclusions").delete().eq("experience_id", row.id);
  const { error: incErr } = await sb.from("experience_inclusions").insert([
    {
      experience_id: row.id,
      included: true,
      title: "Seating and table service",
      detail: "Food and drinks charged separately.",
      sort_order: 0,
    },
    {
      experience_id: row.id,
      included: false,
      title: "Not included: food, drinks, taxes",
      detail: "Any booking extras are extra too.",
      sort_order: 1,
    },
  ]);
  assertOk(`inclusions ${row.slug}`, incErr);
}

const { data } = await sb
  .from("experiences")
  .select("slug,title,verdict,price_from_inr,content")
  .in(
    "slug",
    experiences.map((e) => e.slug),
  );

for (const row of data ?? []) {
  const links = row.content?.links ?? {};
  console.log(row.slug, {
    price: row.price_from_inr,
    verdictOk: Boolean(row.verdict),
    maps: Boolean(links.maps?.url),
    book: Boolean(links.book?.url),
    whatsapp: Boolean(links.whatsapp?.url),
    instagram: Boolean(links.instagram?.url),
    menu: Boolean(links.menu?.url),
    included: (row.content?.included ?? []).length,
  });
}
console.log("Seeded fish thalis with full content + links.");
