/**
 * Upserts the four sundowners with the full research sheet in content (+ real links).
 *
 * Usage:
 *   npm run seed:sundowners
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const rootEnv = resolve(here, "../../.env");
try {
  const raw = readFileSync(rootEnv, "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let v = m[2] ?? "";
    if (v.endsWith('"')) v = v.slice(0, -1);
    if (!process.env[m[1]]) process.env[m[1]] = v;
  }
} catch {
  /* use existing env */
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
    id: "11111111-1111-4111-8111-111111111101",
    business_name: "Paloma",
    person_name: "Reservations team",
    phone_e164: "+919503957036",
    instagram_handle: "paloma.goa",
    verified: false,
    languages: [],
  },
  {
    id: "11111111-1111-4111-8111-111111111102",
    business_name: "Bastian Riviera",
    person_name: "Reservations team",
    phone_e164: "+918655854584",
    instagram_handle: "bastianriviera",
    verified: false,
    languages: [],
  },
  {
    id: "11111111-1111-4111-8111-111111111103",
    business_name: "Pisco By The Beach",
    person_name: "Reservations team",
    phone_e164: "+919665378055",
    instagram_handle: "piscobythebeach",
    verified: false,
    languages: [],
  },
  {
    id: "11111111-1111-4111-8111-111111111104",
    business_name: "Slow Tide",
    person_name: "Reservations team",
    phone_e164: "+918055255266",
    instagram_handle: "slowtidegoa",
    verified: false,
    languages: [],
  },
];

const experiences = [
  {
    id: "22222222-2222-4222-8222-222222222201",
    slug: "paloma",
    title: "Paloma",
    status: "published",
    host_id: hosts[0].id,
    verdict: "A rooftop table, a sea breeze, and no rush to leave.",
    about:
      "Rooftop dining in Anjuna with sea views, cocktails, and sunset tables. Book ahead if you want a good seat for golden hour.",
    duration_minutes: 120,
    group_size_max: 8,
    group_size_label: "Come solo, as a couple, with friends or with family.",
    place_name: "Paloma",
    place_neighborhood: "Anjuna, North Goa",
    place_lat: 15.5736,
    place_lng: 73.7405,
    price_from_inr: 2200,
    price_ask: false,
    price_paid_to: "paid to the venue",
    schedule: {
      days: "Daily",
      timeSlot: "11:30 AM–midnight",
      bestTime: "Arrive around 5 PM and settle in before sunset.",
      ageGroup: "All ages. Alcohol service is subject to age restrictions.",
      minPeople: "1 for normal dining",
      durationLabel: "Allow 1.5–2.5 hours.",
    },
    policy: {
      summary: "Check your booking for any event cover or sunset minimum spend.",
      booking: [
        "Reserve ahead for a sunset table.",
        "No regular cover charge; event nights may have a cover of ₹1,000–₹1,300 — call ahead.",
      ],
      cancellation: [
        "Check the cancellation terms on your booking confirmation.",
      ],
    },
    content: {
      aka: "Paloma Cafe",
      locationLabel: "Anjuna, North Goa",
      priceNarrative: "Approx. ₹2,200",
      priceUnit: "For two, excluding alcohol and taxes.",
      meetingPoint: "Paloma, H 727, Prais Waddo, Anjuna, North Goa",
      droppingPoint: "",
      durationLabel: "Allow 1.5–2.5 hours.",
      additionalInfo:
        "No regular cover charge. Event nights may have a cover of ₹1,000–₹1,300, so call ahead if you’re coming for an event.",
      termsDetail:
        "Check your booking for any event cover or sunset minimum spend.",
      whatToCarry: "",
      included: [],
      notIncluded: [],
      phones: ["+91 95039 57036", "+91 88568 07036"],
      languages: [],
      maxPeople: "",
      distance: "",
      difficulty: "",
      tagsOnDisplay: [
        "Rooftop",
        "Sea View",
        "Sunset",
        "Cocktails",
        "Date Night",
      ],
      faqs: [
        { q: "Why go?", a: "Rooftop sea views and sunset cocktails." },
        { q: "Should I book?", a: "Reserve ahead for a sunset table." },
        {
          q: "Is there a cover?",
          a: "Usually no; event nights may be charged.",
        },
      ],
      links: {
        maps: {
          label: "Map",
          url: "https://www.google.com/maps/search/?api=1&query=Paloma%20H%20727%2C%20Prais%20Waddo%2C%20Anjuna%2C%20North%20Goa%20Goa",
        },
        book: {
          label: "Book",
          url: "https://www.district.in/dining/goa/paloma-anjuna",
        },
        menu: {
          label: "Menu",
          url: "https://www.district.in/dining/goa/paloma-anjuna",
        },
      },
    },
    published_at: new Date().toISOString(),
    tags: ["Rooftop", "Sea View", "Sunset", "Cocktails", "Date Night"],
  },
  {
    id: "22222222-2222-4222-8222-222222222202",
    slug: "bastian-riviera",
    title: "Bastian Riviera",
    status: "published",
    host_id: hosts[1].id,
    verdict: "Start by the backwaters. See where the evening takes you.",
    about:
      "Start beside the Morjim backwaters, with cabanas, pyramid-inspired architecture and a pool around you. Bastian Riviera gives you room to settle into a long meal before the music sets the pace for the evening. Pool access is booked and charged separately.",
    duration_minutes: 180,
    group_size_max: 8,
    group_size_label:
      "Come solo, as a couple, with friends or with family; late-night age rules apply.",
    place_name: "Bastian Riviera",
    place_neighborhood: "Morjim, Parse, North Goa",
    place_lat: 15.6308,
    place_lng: 73.7352,
    price_from_inr: 3000,
    price_ask: false,
    price_paid_to: "paid to the venue",
    schedule: {
      days: "Daily",
      timeSlot: "Noon–12:30 AM",
      bestTime:
        "Late afternoon, with time to enjoy the backwaters before evening.",
      ageGroup:
        "On weekends, entry after 10 PM is 21+. Children may visit earlier, subject to venue rules.",
      minPeople: "1 for normal dining",
      durationLabel: "Allow 2–4 hours, subject to your booking.",
    },
    policy: {
      summary: "Pool access and entry rules apply.",
      booking: [
        "Walk-ins are welcome, but tables can fill up. Book ahead, especially for busy evenings.",
        "Pool access costs extra.",
      ],
      cancellation: [
        "Cancel at least 24 hours ahead for a full refund.",
        "Between 12 and 24 hours, no refund is offered, but you can move your booking to another date.",
      ],
    },
    content: {
      aka: "",
      locationLabel: "Morjim, Parse, North Goa 403512",
      priceNarrative:
        "Weekdays: ₹3,000 per person, all day. Weekends: ₹3,000 per person until 4 PM; ₹5,000 per person from 4 PM onwards.",
      priceUnit: "Per person",
      meetingPoint: "Bastian Riviera, Morjim, Parse, North Goa 403512",
      droppingPoint: "",
      durationLabel: "Allow 2–4 hours, subject to your booking.",
      additionalInfo:
        "Walk-ins are welcome, but tables can fill up. Book ahead, especially for busy evenings. Pool access costs extra.",
      termsDetail:
        "Pool access: ₹1,000 plus tax per person, Tuesday–Sunday, 2–10 PM. Venue dress code and entry rules apply.",
      whatToCarry: "",
      included: [],
      notIncluded: [],
      phones: ["+91 86558 54584"],
      languages: [],
      maxPeople: "",
      distance: "",
      difficulty: "",
      tagsOnDisplay: [
        "Luxury",
        "Waterfront",
        "Sundowner",
        "Pool",
        "Cocktails",
        "Music",
      ],
      faqs: [
        { q: "Is the pool included?", a: "No, access is charged separately." },
        { q: "Can I walk in?", a: "Yes, subject to availability." },
        { q: "Late-night entry?", a: "Weekend entry after 10 PM is 21+." },
      ],
      links: {
        maps: {
          label: "Map",
          url: "https://www.google.com/maps/search/?api=1&query=Bastian%20Riviera%20Morjim%2C%20Parse%2C%20North%20Goa%20403512%20Goa",
        },
        book: {
          label: "Book",
          url: "https://www.bastianhospitality.com/riviera",
        },
        whatsapp: {
          label: "WhatsApp",
          url: "https://wa.me/918655854583",
        },
        menu: {
          label: "Menu",
          url: "https://www.bastianhospitality.com/riviera",
        },
      },
    },
    published_at: new Date().toISOString(),
    tags: ["Luxury", "Waterfront", "Sundowner", "Pool", "Cocktails", "Music"],
  },
  {
    id: "22222222-2222-4222-8222-222222222203",
    slug: "pisco-by-the-beach",
    title: "Pisco By The Beach",
    status: "published",
    host_id: hosts[2].id,
    verdict: "Take the hammock seat. Let the waves set the pace.",
    about:
      "There’s a hammock seat above the shoreline and a view that makes it easy to lose track of time. At Pisco By The Beach, you can watch the water, order from the daytime or evening menu, and let sunset turn into a music-filled evening.",
    duration_minutes: 120,
    group_size_max: 8,
    group_size_label: "Come solo, as a couple, with friends or with family.",
    place_name: "Bastian Riviera",
    place_neighborhood: "Anjuna, North Goa",
    place_lat: 15.571776,
    place_lng: 73.741827,
    price_from_inr: 1500,
    price_ask: false,
    price_paid_to: "paid to the venue",
    schedule: {
      days: "Daily",
      timeSlot: "12:30 PM–midnight",
      bestTime: "Arrive around 5 PM for sunset.",
      ageGroup: "All ages. Alcohol service is subject to age restrictions.",
      minPeople: "1 for normal dining",
      durationLabel: "Allow 1.5–2.5 hours.",
    },
    policy: {
      summary: "Minimum spend depends on seating.",
      booking: [
        "Hammock seating fits up to three guests.",
        "Expect louder DJ music around sunset.",
        "Book by phone or WhatsApp.",
      ],
      cancellation: [],
    },
    content: {
      aka: "",
      locationLabel:
        "St Michael Vaddo, near Anjuna Flea Market, Anjuna 403509",
      priceNarrative:
        "Minimum spend: ₹1,500–₹2,500 per person, depending on seating.",
      priceUnit: "Per person; redeemable against your order.",
      meetingPoint:
        "Pisco By The Beach, St Michael Vaddo, near Anjuna Flea Market, Anjuna 403509",
      droppingPoint: "",
      durationLabel: "Allow 1.5–2.5 hours.",
      additionalInfo:
        "Hammock seating fits up to three guests. Expect louder DJ music around sunset.",
      termsDetail:
        "Minimum spend per person: hammock ₹2,500; premium sea view ₹2,000; regular sea view ₹1,500. Check your seating category when booking.",
      whatToCarry: "",
      included: [],
      notIncluded: [],
      phones: ["+91 96653 78055", "+91 91750 57207"],
      languages: [],
      maxPeople: "",
      distance: "",
      difficulty: "",
      tagsOnDisplay: [
        "Beachfront",
        "Hammock Seating",
        "Sunset",
        "Cocktails",
        "Music",
      ],
      faqs: [
        {
          q: "Want a hammock?",
          a: "Ask about availability when booking.",
        },
        { q: "How many can share one?", a: "Up to three guests." },
        {
          q: "Is it quiet?",
          a: "DJ music can be loud around sunset.",
        },
      ],
      links: {
        maps: {
          label: "Map",
          url: "https://www.google.com/maps/search/?api=1&query=Pisco%20By%20The%20Beach%20St%20Michael%20Vaddo%2C%20near%20Anjuna%20Flea%20Market%2C%20Anjuna%20403509%20Goa",
        },
        book: {
          label: "Book by phone or WhatsApp",
          url: "https://api.whatsapp.com/send/?phone=919665378055&text&type=phone_number&app_absent=0",
        },
        whatsapp: {
          label: "wa",
          url: "https://api.whatsapp.com/send/?phone=919665378055&text&type=phone_number&app_absent=0",
        },
        menu: {
          label: "Menu",
          url: "https://piscobythebeach.com/",
        },
      },
    },
    published_at: new Date().toISOString(),
    tags: ["Beachfront", "Hammock Seating", "Sunset", "Cocktails", "Music"],
  },
  {
    id: "22222222-2222-4222-8222-222222222204",
    slug: "slow-tide",
    title: "Slow Tide",
    status: "published",
    host_id: hosts[3].id,
    verdict: "An old Anjuna shack, with a new chapter by the sea.",
    about:
      "Slow Tide sits where Anjuna’s old San Francisco shack once stood. Its coastal food, cocktails and sea views carry that beachside chapter into a new space. Book a sea-facing table, arrive before sunset, and leave yourself time to linger over dinner.",
    duration_minutes: 120,
    group_size_max: 8,
    group_size_label: "Come solo, as a couple, with friends or with family.",
    place_name: "Slow Tide",
    place_neighborhood: "Anjuna, North Goa",
    place_lat: 15.5794,
    place_lng: 73.7408,
    price_from_inr: 2400,
    price_ask: false,
    price_paid_to: "paid to the venue",
    schedule: {
      days: "Daily",
      timeSlot: "11 AM–11:30 PM",
      bestTime: "Late afternoon, before sunset.",
      ageGroup: "All ages. Alcohol service is subject to age restrictions.",
      minPeople: "1 for normal dining",
      durationLabel: "Allow 1.5–2.5 hours.",
    },
    policy: {
      summary: "Check your booking for the cover charge and any minimum spend.",
      booking: [
        "Book sea-facing seats early.",
        "The access road is narrow and parking may be a short walk away.",
        "Call the venue about walk-in entry.",
      ],
      cancellation: [],
    },
    content: {
      aka: "Former site of San Francisco shack",
      locationLabel: "Dmello Vaddo, Anjuna, North Goa 403509",
      priceNarrative:
        "Approx. ₹2,400–₹2,500 for two. Online cover: ₹1,000 per person.",
      priceUnit:
        "Dining estimate for two, excluding alcohol and taxes. Cover is charged per person.",
      meetingPoint: "Slow Tide, Dmello Vaddo, Anjuna, North Goa 403509",
      droppingPoint: "",
      durationLabel: "Allow 1.5–2.5 hours.",
      additionalInfo:
        "Book sea-facing seats early. The access road is narrow and parking may be a short walk away. Call the venue about walk-in entry.",
      termsDetail:
        "Check your booking for the cover charge and any minimum spend.",
      whatToCarry: "",
      included: [],
      notIncluded: [],
      phones: ["+91 80552 55266"],
      languages: [],
      maxPeople: "",
      distance: "",
      difficulty: "",
      tagsOnDisplay: [
        "Beachfront",
        "Coastal Cuisine",
        "Cocktails",
        "Heritage",
        "Sunset",
      ],
      faqs: [
        { q: "Where should I sit?", a: "Ask for a sea-facing table." },
        { q: "Can I walk in?", a: "Call ahead about entry." },
        { q: "Parking?", a: "Allow time for a short walk." },
      ],
      links: {
        maps: {
          label: "Map",
          url: "https://www.google.com/maps/search/?api=1&query=Slow%20Tide%20Dmello%20Vaddo%2C%20Anjuna%2C%20North%20Goa%20403509%20Goa",
        },
        book: {
          label: "Book",
          url: "http://bookings.airmenus.in/",
        },
        instagram: {
          label: "Instagram",
          url: "https://www.instagram.com/slowtidegoa/",
        },
        menu: {
          label: "Menu",
          url: "https://www.zomato.com/goa/slow-tide-anjuna/menu",
        },
      },
    },
    published_at: new Date().toISOString(),
    tags: ["Beachfront", "Coastal Cuisine", "Cocktails", "Heritage", "Sunset"],
  },
];

function assertOk(label, error) {
  if (error) {
    console.error(label, error);
    process.exit(1);
  }
}

const probe = await sb.from("experiences").select("id").limit(1);
if (probe.error?.code === "PGRST205") {
  console.error(
    "Tables missing. Run bootstrap SQL in Supabase first.",
  );
  process.exit(2);
}
assertOk("probe", probe.error);

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

const { data: check } = await sb
  .from("experiences")
  .select("slug,title,content")
  .in(
    "slug",
    experiences.map((e) => e.slug),
  );
for (const row of check ?? []) {
  const links = row.content?.links ?? {};
  console.log(row.slug, {
    maps: Boolean(links.maps?.url),
    book: Boolean(links.book?.url),
    whatsapp: Boolean(links.whatsapp?.url),
    instagram: Boolean(links.instagram?.url),
    menu: Boolean(links.menu?.url),
  });
}
console.log("Seeded sundowners with full content + links.");
