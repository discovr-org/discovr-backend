import type { Experience, FeedSection } from "../../domain/experience.js";

const kayakPolicy = {
  summary: "Free cancellation until 6pm on the day",
  booking: [
    "Book by calling or WhatsApping Mangrove Trails. Payments don't go through discovr.",
    "Your spot is held once Priya confirms the time on the call.",
    "Pay Priya at the jetty, in cash or UPI. ₹1,400 per person, nothing on top.",
    "13 and over. Under-18s come with an adult.",
  ],
  cancellation: [
    "Free cancellation until 6pm on the day. Call or WhatsApp Priya to cancel.",
    "After 6pm, still let her know. A held spot is one she can't give to someone else.",
    "If the tide or the weather makes it unsafe, she cancels and moves you to another night.",
  ],
};

const thaliPolicy = {
  summary: "Free cancellation until 4pm on the day",
  booking: [
    "Book by calling or WhatsApping Maria by 4pm on the day. She cooks for the number booked.",
    "Tell her about allergies, and if anyone wants the vegetarian thali, when you call.",
    "Pay Maria at the table, in cash or UPI. ₹1,100 per person; drinks are extra.",
  ],
  cancellation: [
    "Free cancellation until 4pm on the day. Call or WhatsApp Maria to cancel.",
    "After 4pm she has already shopped and cooked for you, so she asks for ₹500 per person.",
    "Running late is fine. Dinner waits up to 30 minutes.",
  ],
};

export const seedExperiences: Experience[] = [
  {
    id: "exp_kayak",
    slug: "night-kayak-mangroves",
    title: "Night kayak through the mangroves",
    host: {
      businessName: "Mangrove Trails",
      personName: "Priya",
      phone: "+919876543210",
      instagramHandle: "mangrovetrails.goa",
      avatar: { src: "/demo/host-priya.png", alt: "Priya" },
      verified: true,
      experienceCount: 84,
      languages: ["Konkani", "Hindi", "English"],
    },
    photos: [
      {
        src: "/demo/kayak-night.png",
        alt: "Kayaks in the dark, the water glowing green around the paddles",
      },
      { src: "/demo/setting-off.png", alt: "Setting off from the jetty at sunset" },
      { src: "/demo/jetty-dusk.png", alt: "The Siolim jetty at dusk" },
      { src: "/demo/back-on-the-bank.png", alt: "The group back on the bank under a lamp" },
    ],
    verdict:
      "The bioluminescence is real, and it's worth the mosquito bites. Go for 6:30, not 8, or you lose the last of the light on the way out.",
    price: { fromAmount: 1400, paidTo: "paid to the host" },
    place: {
      name: "Siolim jetty, North Goa",
      neighborhood: "Siolim",
      lat: 15.6236,
      lng: 73.7562,
    },
    schedule: {
      Tue: ["6:30pm", "8pm"],
      Wed: ["6:30pm", "8pm"],
      Thu: ["6:30pm", "8pm"],
      Fri: ["6:30pm", "8pm", "9:30pm"],
      Sat: ["6:30pm", "8pm", "9:30pm"],
      Sun: ["6:30pm", "8pm"],
    },
    durationMinutes: 180,
    groupSizeLabel: "up to 6 people",
    about:
      "Paddle out from the Siolim jetty after dark. Once your eyes adjust, the water lights up with every stroke. The guide keeps the group close and nobody needs to have kayaked before. You'll get splashed, so bring a change of clothes.",
    included: [
      {
        included: true,
        title: "Kayak, paddle and life jacket",
        detail: "Double kayaks, so you'll share with someone",
      },
      {
        included: true,
        title: "A guide who knows the tide tables",
        detail: "Priya or one of her two guides",
      },
      {
        included: false,
        title: "Not included: the ride to Siolim",
        detail: "Scooter parking at the jetty is free",
      },
    ],
    policy: kayakPolicy,
    reviews: {
      average: 4.8,
      count: 126,
      distribution: [93, 21, 8, 3, 1],
      items: [
        {
          id: "r1",
          name: "Aarav",
          context: "Last week · came solo",
          score: 5,
          body: "Went on the 8pm and it was fully dark by the time we got to the glowing bit. Priya pairs you up if you're alone, which I was. Mosquito spray is not optional.",
        },
        {
          id: "r2",
          name: "Sana",
          context: "2 weeks ago · group of 4",
          score: 4,
          body: "Four of us, two kayaks. The glow is brighter than the photos. The walk back from the jetty to the parking is unlit, so bring a torch or a phone with charge.",
        },
      ],
    },
    tags: ["tonight", "kayak", "nature"],
  },
  {
    id: "exp_thali",
    slug: "goan-thali-assagao",
    title: "Goan thali dinner in an Assagao home",
    host: {
      businessName: "Maria's Kitchen",
      personName: "Maria",
      phone: "+919812345678",
      instagramHandle: "mariaskitchen.assagao",
      avatar: { src: "/demo/thali/host-maria.png", alt: "Maria" },
      verified: true,
      experienceCount: 62,
      languages: ["Konkani", "English", "Hindi"],
    },
    photos: [
      {
        src: "/demo/thali/thali-overhead.png",
        alt: "A steel thali seen from above: rice, fish curry, a fry, two bhajis and sol kadi",
      },
      { src: "/demo/thali/verandah-dusk.png", alt: "The verandah at dusk with the lamps on" },
      { src: "/demo/thali/curry-pot.png", alt: "Fish curry on the stove in a clay pot" },
    ],
    verdict:
      "Better than anything on the beach road, and Maria will notice if you don't finish. Ask for the sol kadi even if you think you don't like it.",
    price: { fromAmount: 1100, paidTo: "paid at the table", askForPrice: true },
    place: {
      name: "Assagao, North Goa",
      neighborhood: "Assagao",
      lat: 15.5937,
      lng: 73.7647,
    },
    schedule: {
      Tue: ["7:30pm"],
      Wed: ["7:30pm"],
      Thu: ["7:30pm"],
      Fri: ["7:30pm"],
      Sat: ["7:30pm"],
      Sun: ["1pm", "7:30pm"],
    },
    durationMinutes: 120,
    groupSizeLabel: "up to 8 people",
    about:
      "Dinner at Maria's family table in Assagao: whatever came off the boats that morning, cooked the way her mother did. It's a set thali, so there's nothing to order, and a vegetarian thali is always on. Tell her about allergies when you call.",
    included: [
      {
        included: true,
        title: "The full thali",
        detail: "Rice, curry, a fry and two bhajis. Second helpings are expected",
      },
      {
        included: true,
        title: "Sol kadi and something sweet",
        detail: "Bebinca on weekends",
      },
      {
        included: false,
        title: "Not included: drinks",
        detail: "Feni, urrak and beer from the menu, paid to Maria",
      },
    ],
    menu: {
      pages: [
        {
          src: "/demo/thali/menu-tonights-thali.jpg",
          label: "Tonight's thali",
          alt: "Tonight's thali: kingfish rava fry or prawns, ambot tik, red rice and fish curry, two bhajis, sol kadi.",
        },
        {
          src: "/demo/thali/menu-vegetarian.jpg",
          label: "Vegetarian",
          alt: "Vegetarian thali: mushroom xacuti, tondak, red rice and dal, two bhajis, sol kadi.",
        },
        {
          src: "/demo/thali/menu-drinks.jpg",
          label: "Drinks",
          alt: "Drinks: cashew feni ₹150, urrak ₹150, kokum soda ₹80, beer ₹120, lime soda ₹60.",
        },
      ],
    },
    policy: thaliPolicy,
    tags: ["tonight", "food", "sundowner"],
  },
  {
    id: "exp_paloma",
    slug: "paloma",
    title: "Paloma",
    host: {
      businessName: "Paloma",
      personName: "Reservations team",
      phone: "+919503957036",
      verified: false,
      languages: [],
    },
    photos: [
      {
        src: "/demo/jetty-dusk.png",
        alt: "Rooftop tables overlooking the sea at dusk",
      },
    ],
    verdict: "A rooftop table, a sea breeze, and no rush to leave.",
    price: { fromAmount: 2200, paidTo: "paid to the venue" },
    place: {
      name: "Paloma",
      neighborhood: "Anjuna, North Goa",
      lat: 15.5736,
      lng: 73.7405,
    },
    schedule: { Mon: ["11:30am"], Tue: ["11:30am"], Wed: ["11:30am"], Thu: ["11:30am"], Fri: ["11:30am"], Sat: ["11:30am"], Sun: ["11:30am"] },
    durationMinutes: 120,
    groupSizeLabel: "Come solo, as a couple, with friends or with family.",
    about:
      "Rooftop dining in Anjuna with sea views, cocktails, and sunset tables. Book ahead if you want a good seat for golden hour.",
    included: [],
    policy: {
      summary: "Check your booking for any event cover or sunset minimum spend.",
      booking: [
        "Reserve ahead for a sunset table.",
        "No regular cover charge; event nights may have a cover of ₹1,000–₹1,300 — call ahead.",
      ],
      cancellation: ["Check the cancellation terms on your booking confirmation."],
    },
    tags: ["Rooftop", "Sea View", "Sunset", "Cocktails", "Date Night"],
  },
  {
    id: "exp_bastian",
    slug: "bastian-riviera",
    title: "Bastian Riviera",
    host: {
      businessName: "Bastian Riviera",
      personName: "Reservations team",
      phone: "+918655854584",
      verified: false,
      languages: [],
    },
    photos: [
      {
        src: "/demo/back-on-the-bank.png",
        alt: "Cabanas by the Morjim backwaters",
      },
    ],
    verdict: "Start by the backwaters. See where the evening takes you.",
    price: { fromAmount: 3000, paidTo: "paid to the venue" },
    place: {
      name: "Bastian Riviera",
      neighborhood: "Morjim, Parse, North Goa",
      lat: 15.6308,
      lng: 73.7352,
    },
    schedule: { Mon: ["12pm"], Tue: ["12pm"], Wed: ["12pm"], Thu: ["12pm"], Fri: ["12pm"], Sat: ["12pm"], Sun: ["12pm"] },
    durationMinutes: 180,
    groupSizeLabel:
      "Come solo, as a couple, with friends or with family; late-night age rules apply.",
    about:
      "Start beside the Morjim backwaters, with cabanas, pyramid-inspired architecture and a pool around you. Bastian Riviera gives you room to settle into a long meal before the music sets the pace for the evening. Pool access is booked and charged separately.",
    included: [],
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
    tags: ["Luxury", "Waterfront", "Sundowner", "Pool", "Cocktails", "Music"],
  },
  {
    id: "exp_pisco",
    slug: "pisco-by-the-beach",
    title: "Pisco By The Beach",
    host: {
      businessName: "Pisco By The Beach",
      personName: "Reservations team",
      phone: "+919665378055",
      verified: false,
      languages: [],
    },
    photos: [
      {
        src: "/demo/thali/verandah-dusk.png",
        alt: "Hammock seating above the shoreline",
      },
    ],
    verdict: "Take the hammock seat. Let the waves set the pace.",
    price: { fromAmount: 1500, paidTo: "paid to the venue" },
    place: {
      name: "Bastian Riviera",
      neighborhood: "Anjuna, North Goa",
      lat: 15.5752,
      lng: 73.7421,
    },
    schedule: { Mon: ["12:30pm"], Tue: ["12:30pm"], Wed: ["12:30pm"], Thu: ["12:30pm"], Fri: ["12:30pm"], Sat: ["12:30pm"], Sun: ["12:30pm"] },
    durationMinutes: 120,
    groupSizeLabel: "Come solo, as a couple, with friends or with family.",
    about:
      "There’s a hammock seat above the shoreline and a view that makes it easy to lose track of time. At Pisco By The Beach, you can watch the water, order from the daytime or evening menu, and let sunset turn into a music-filled evening.",
    included: [],
    policy: {
      summary: "Minimum spend depends on seating.",
      booking: [
        "Hammock seating fits up to three guests.",
        "Expect louder DJ music around sunset.",
        "Book by phone or WhatsApp.",
      ],
      cancellation: [],
    },
    tags: ["Beachfront", "Hammock Seating", "Sunset", "Cocktails", "Music"],
  },
  {
    id: "exp_slow_tide",
    slug: "slow-tide",
    title: "Slow Tide",
    host: {
      businessName: "Slow Tide",
      personName: "Reservations team",
      phone: "+918055255266",
      verified: false,
      languages: [],
    },
    photos: [
      {
        src: "/demo/setting-off.png",
        alt: "Sea-facing tables at Slow Tide",
      },
    ],
    verdict: "An old Anjuna shack, with a new chapter by the sea.",
    price: { fromAmount: 2400, paidTo: "paid to the venue" },
    place: {
      name: "Slow Tide",
      neighborhood: "Anjuna, North Goa",
      lat: 15.5794,
      lng: 73.7408,
    },
    schedule: { Mon: ["11am"], Tue: ["11am"], Wed: ["11am"], Thu: ["11am"], Fri: ["11am"], Sat: ["11am"], Sun: ["11am"] },
    durationMinutes: 120,
    groupSizeLabel: "Come solo, as a couple, with friends or with family.",
    about:
      "Slow Tide sits where Anjuna’s old San Francisco shack once stood. Its coastal food, cocktails and sea views carry that beachside chapter into a new space. Book a sea-facing table, arrive before sunset, and leave yourself time to linger over dinner.",
    included: [],
    policy: {
      summary: "Check your booking for the cover charge and any minimum spend.",
      booking: [
        "Book sea-facing seats early.",
        "The access road is narrow and parking may be a short walk away.",
        "Call the venue about walk-in entry.",
      ],
      cancellation: [],
    },
    tags: ["Beachfront", "Coastal Cuisine", "Cocktails", "Heritage", "Sunset"],
  },
  {
    id: "exp_bombil",
    slug: "bombil",
    title: "Bombil",
    host: {
      businessName: "Bombil",
      personName: "Reservations team",
      phone: "+919823291413",
      verified: false,
      languages: [],
    },
    photos: [
      {
        src: "/demo/thali/thali-overhead.png",
        alt: "A Goan fish thali at Bombil",
      },
    ],
    verdict: "Jo missed his old family haunts. So he built one.",
    price: { fromAmount: 500, paidTo: "paid to the venue" },
    place: {
      name: "Bombil",
      neighborhood: "Campal, Panaji",
      lat: 15.4967,
      lng: 73.8196,
    },
    schedule: {
      Mon: ["12pm", "7:30pm"],
      Tue: ["12pm", "7:30pm"],
      Wed: ["12pm", "7:30pm"],
      Thu: ["12pm", "7:30pm"],
      Fri: ["12pm", "7:30pm"],
      Sat: ["12pm", "7:30pm"],
      Sun: ["12pm", "7:30pm"],
    },
    durationMinutes: 90,
    groupSizeLabel: "Come solo, as a couple, with friends or with family.",
    about:
      "Jo missed the small Goan eateries he used to visit with his father, so he created Bombil. Come for a homestyle thali built around the day’s fish, local curries and house pickles. Get there early for lunch. The tables fill quickly.",
    included: [
      {
        included: true,
        title: "Seating and table service",
        detail: "Food and drinks charged separately.",
      },
      {
        included: false,
        title: "Not included: food, drinks, taxes",
        detail: "Any booking extras are extra too.",
      },
    ],
    tags: ["Goan Fish Thali", "Homestyle", "Seafood", "Local Favourite"],
  },
  {
    id: "exp_vinayak",
    slug: "vinayak-family-restaurant",
    title: "Vinayak Family Restaurant",
    host: {
      businessName: "Vinayak Family Restaurant",
      personName: "Reservations team",
      phone: "+919049380518",
      verified: false,
      languages: [],
    },
    photos: [
      {
        src: "/demo/thali/verandah-dusk.png",
        alt: "Open-sided seating at Vinayak",
      },
    ],
    verdict: "A family kitchen and a thali that keeps Assagao coming back.",
    price: { fromAmount: 390, paidTo: "paid to the venue" },
    place: {
      name: "Vinayak Family Restaurant",
      neighborhood: "Assagao, North Goa",
      lat: 15.5937,
      lng: 73.7647,
    },
    schedule: {
      Mon: ["12pm", "7pm"],
      Tue: ["12pm", "7pm"],
      Wed: ["12pm", "7pm"],
      Fri: ["12pm", "7pm"],
      Sat: ["12pm", "7pm"],
      Sun: ["12pm", "7pm"],
    },
    durationMinutes: 90,
    groupSizeLabel: "Come solo, as a couple, with friends or with family.",
    about:
      "A family kitchen, a view of the paddy fields and a thali that brings people back to Assagao. Vinayak keeps things simple: Goan seafood, local flavours and generous plates. Arrive before the lunch rush and take your time with the meal.",
    included: [
      {
        included: true,
        title: "Seating and table service",
        detail: "Food and drinks charged separately.",
      },
      {
        included: false,
        title: "Not included: food, drinks, taxes",
        detail: "Any booking extras are extra too.",
      },
    ],
    tags: ["Goan Fish Thali", "Family Run", "Seafood", "Value"],
  },
  {
    id: "exp_kokni",
    slug: "kokni-kanteen",
    title: "Kokni Kanteen",
    host: {
      businessName: "Kokni Kanteen",
      personName: "Reservations team",
      phone: "+919579275664",
      verified: false,
      languages: [],
    },
    photos: [
      {
        src: "/demo/thali/curry-pot.png",
        alt: "Fish curry at Kokni Kanteen",
      },
    ],
    verdict: "Old Panaji has been coming here for fish curry since 1972.",
    price: { fromAmount: 1300, paidTo: "paid to the venue" },
    place: {
      name: "Kokni Kanteen",
      neighborhood: "Panaji",
      lat: 15.4909,
      lng: 73.8278,
    },
    schedule: {
      Mon: ["12:30pm"],
      Tue: ["12:30pm"],
      Wed: ["12:30pm"],
      Thu: ["12:30pm"],
      Fri: ["12:30pm"],
      Sat: ["12:30pm"],
      Sun: ["12:30pm"],
    },
    durationMinutes: 90,
    groupSizeLabel: "Come solo, as a couple, with friends or with family.",
    about:
      "Since 1972, Kokni Kanteen has been serving the flavours people associate with home in Goa. Step into its old Panaji setting for a fish thali, local curries and seafood sides. Come early for lunch, before the queue starts building.",
    included: [
      {
        included: true,
        title: "Seating and table service",
        detail: "Food and drinks charged separately.",
      },
      {
        included: false,
        title: "Not included: food, drinks, taxes",
        detail: "Any booking extras are extra too.",
      },
    ],
    tags: ["Konkani", "Heritage", "Fish Thali", "Traditional", "Panaji"],
  },
  {
    id: "exp_ritz",
    slug: "ritz-classic-panjim",
    title: "Ritz Classic Panjim",
    host: {
      businessName: "Ritz Classic Panjim",
      personName: "Reservations team",
      phone: "+918322426417",
      verified: false,
      languages: [],
    },
    photos: [
      {
        src: "/demo/thali/thali-overhead.png",
        alt: "Fish thali at Ritz Classic Panjim",
      },
    ],
    verdict: "The fish-thali lunch Panaji keeps coming back to.",
    price: { fromAmount: 362, paidTo: "paid to the venue" },
    place: {
      name: "Ritz Classic Panjim",
      neighborhood: "Panaji",
      lat: 15.4989,
      lng: 73.8272,
    },
    schedule: {
      Mon: ["11am"],
      Tue: ["11am"],
      Wed: ["11am"],
      Thu: ["11am"],
      Fri: ["11am"],
      Sat: ["11am"],
      Sun: ["11am"],
    },
    durationMinutes: 90,
    groupSizeLabel: "Come solo, as a couple, with friends or with family.",
    about:
      "Some lunches become a habit. At Ritz Classic, that habit is a Goan fish thali filled with curries, seafood sides and familiar flavours. Head to the 18th June Road branch in Panaji for a meal that has kept generations of diners returning.",
    included: [
      {
        included: true,
        title: "Seating and table service",
        detail: "Food and drinks charged separately.",
      },
      {
        included: false,
        title: "Not included: food, drinks, taxes",
        detail: "Any booking extras are extra too.",
      },
    ],
    tags: ["Goan Fish Thali", "Heritage", "Seafood", "Panaji Classic"],
  },
];

export const seedFeed: FeedSection[] = [
  {
    id: "sundowners",
    title: "Find your table for sunset",
    density: "portrait",
    items: [
      {
        slug: "paloma",
        title: "Paloma",
        placeLabel: "Anjuna",
        imageSrc: "/demo/jetty-dusk.png",
        imageAlt: "Rooftop tables overlooking the sea at dusk",
        priceInr: 2200,
      },
      {
        slug: "bastian-riviera",
        title: "Bastian Riviera",
        placeLabel: "Morjim",
        imageSrc: "/demo/back-on-the-bank.png",
        imageAlt: "Cabanas by the Morjim backwaters",
        priceInr: 3000,
      },
      {
        slug: "pisco-by-the-beach",
        title: "Pisco By The Beach",
        placeLabel: "Anjuna",
        imageSrc: "/demo/thali/verandah-dusk.png",
        imageAlt: "Hammock seating above the shoreline",
        priceInr: 1500,
      },
      {
        slug: "slow-tide",
        title: "Slow Tide",
        placeLabel: "Anjuna",
        imageSrc: "/demo/setting-off.png",
        imageAlt: "Sea-facing tables at Slow Tide",
        priceInr: 2400,
      },
    ],
  },
  {
    id: "goan-fish-thali",
    title: "Goan lunches with a story",
    density: "portrait",
    items: [
      {
        slug: "bombil",
        title: "Bombil",
        placeLabel: "Campal, Panaji",
        imageSrc: "/demo/thali/thali-overhead.png",
        imageAlt: "A Goan fish thali at Bombil",
        priceInr: 500,
      },
      {
        slug: "vinayak-family-restaurant",
        title: "Vinayak Family Restaurant",
        placeLabel: "Assagao",
        imageSrc: "/demo/thali/verandah-dusk.png",
        imageAlt: "Open-sided seating at Vinayak",
        priceInr: 390,
      },
      {
        slug: "kokni-kanteen",
        title: "Kokni Kanteen",
        placeLabel: "Panaji",
        imageSrc: "/demo/thali/curry-pot.png",
        imageAlt: "Fish curry at Kokni Kanteen",
        priceInr: 1300,
      },
      {
        slug: "ritz-classic-panjim",
        title: "Ritz Classic Panjim",
        placeLabel: "Panaji",
        imageSrc: "/demo/thali/thali-overhead.png",
        imageAlt: "Fish thali at Ritz Classic Panjim",
        priceInr: 362,
      },
    ],
  },
  {
    id: "nightlife",
    title: "Nightlife",
    density: "portrait",
    items: [
      {
        slug: "night-kayak-mangroves",
        title: "Juna",
        placeLabel: "Anjuna",
        imageSrc: "/demo/kayak-night.png",
        imageAlt: "Warm wood ceiling lights in a night venue",
        priceInr: 1200,
      },
      {
        slug: "goan-thali-assagao",
        title: "Raeeth",
        placeLabel: "Vagator",
        imageSrc: "/demo/setting-off.png",
        imageAlt: "Blue-lit tropical foliage outside a club",
        priceInr: 1500,
      },
      {
        slug: "night-kayak-mangroves",
        title: "Hilltop",
        placeLabel: "Anjuna",
        imageSrc: "/demo/thali/curry-pot.png",
        imageAlt: "A late-night crowd under warm bulbs",
        priceInr: 1000,
      },
    ],
  },
  {
    id: "surf",
    title: "Surfing",
    density: "landscape",
    items: [
      {
        slug: "night-kayak-mangroves",
        title: "Get Into The Waves At Surf Wala",
        placeLabel: "Arambol",
        imageSrc: "/demo/back-on-the-bank.png",
        imageAlt: "Someone paddling out into the Arabian Sea",
        blurb:
          "Learn to read the waves, find your balance, and ride the Arabian Sea with a surfing experience that's worth the early start.",
        durationLabel: "1 hour 30 min",
        priceInr: 3000,
      },
    ],
  },
  {
    id: "local-bars",
    title: "The OG local bars of Goa",
    density: "portrait",
    items: [
      {
        slug: "goan-thali-assagao",
        title: "Joseph Bar",
        placeLabel: "Panaji",
        imageSrc: "/demo/thali/curry-pot.png",
        imageAlt: "A local bar storefront at night",
        priceInr: 800,
      },
      {
        slug: "night-kayak-mangroves",
        title: "Cajy Bar",
        placeLabel: "Fontainhas",
        imageSrc: "/demo/thali/thali-overhead.png",
        imageAlt: "A small Goan bar with warm light",
        priceInr: 700,
      },
    ],
  },
  {
    id: "kayak",
    title: "Into the mangroves",
    density: "portrait",
    items: [
      {
        slug: "night-kayak-mangroves",
        title: "Into the Wild Mangroves At Baga Kayaking",
        placeLabel: "Baga",
        imageSrc: "/demo/kayak-night.png",
        imageAlt: "A yellow kayak on dark water",
        priceInr: 300,
      },
    ],
  },
];
