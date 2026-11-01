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
];

export const seedFeed: FeedSection[] = [
  {
    id: "sundowners",
    title: "The best sundowners of North Goa",
    density: "portrait",
    items: [
      {
        slug: "night-kayak-mangroves",
        title: "Pisco By The Beach",
        placeLabel: "Anjuna",
        imageSrc: "/demo/jetty-dusk.png",
        imageAlt: "Warm lights on a beach restaurant verandah at dusk",
        priceInr: 1400,
      },
      {
        slug: "goan-thali-assagao",
        title: "Slow Tide",
        placeLabel: "Anjuna",
        imageSrc: "/demo/thali/verandah-dusk.png",
        imageAlt: "Palm trees and a beach bar at golden hour",
        priceInr: 1600,
      },
      {
        slug: "goan-thali-assagao",
        title: "Bastian Riviera",
        placeLabel: "Morjim",
        imageSrc: "/demo/back-on-the-bank.png",
        imageAlt: "A riverside restaurant lit for sundown",
        priceInr: 1800,
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
