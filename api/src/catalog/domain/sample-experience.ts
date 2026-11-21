import type { Experience } from "./experience.js";

/**
 * A made-up listing with every field filled, so a category's layout can be previewed in full before any real
 * listing uses it. Photos are the demo images the guest app ships. It is never stored or shown to guests.
 */
export function sampleExperience(): Experience {
  return {
    id: "sample",
    slug: "sample-listing",
    title: "Sample listing",
    host: {
      businessName: "Sample Host",
      personName: "Alex",
      phone: "+910000000000",
      instagramHandle: "samplehost",
      avatar: { src: "/demo/host-priya.png", alt: "Alex" },
      verified: true,
      experienceCount: 12,
      languages: ["English", "Hindi"],
    },
    photos: [
      { src: "/demo/kayak-night.png", alt: "Sample photo one" },
      { src: "/demo/setting-off.png", alt: "Sample photo two" },
      { src: "/demo/jetty-dusk.png", alt: "Sample photo three" },
    ],
    verdict: "A one-line take that could only be about this place, written the way a friend would say it.",
    price: { fromAmount: 1500, paidTo: "paid to the host", taxes: "inclusive" },
    place: { name: "Sample place", neighborhood: "Baga", lat: 15.5553, lng: 73.7517 },
    schedule: { Mon: ["8:00 AM", "10:00 AM"], Tue: ["8:00 AM", "10:00 AM"], Wed: ["8:00 AM", "10:00 AM"], Thu: ["8:00 AM", "10:00 AM"], Fri: ["8:00 AM", "10:00 AM"], Sat: ["8:00 AM", "10:00 AM"], Sun: ["8:00 AM", "10:00 AM"] },
    durationMinutes: 90,
    groupSizeLabel: "Solo, group or couple. For a group larger than 4, call them.",
    about: "This is sample text for the About block. It shows how a longer description sits on the page.\n\nA second paragraph shows the spacing between paragraphs.",
    included: [
      { included: true, title: "Equipment" },
      { included: true, title: "A guide" },
      { included: false, title: "Food and drinks" },
    ],
    menu: { pages: [{ src: "/demo/thali/menu-tonights-thali.jpg", label: "Menu", alt: "Sample menu" }] },
    policy: {
      summary: "Sample booking and cancellation terms.",
      booking: ["Book by phone at least a day ahead.", "Pay the host on the day."],
      cancellation: ["Free cancellation until the day before.", "Later cancellations may be charged."],
      showFinalTermsNote: true,
    },
    reviews: {
      average: 4.6,
      count: 2,
      distribution: [1, 1, 0, 0, 0],
      items: [
        { id: "r1", name: "Sam", context: "Went in November", score: 5, body: "A sample review that shows how guest reviews look." },
        { id: "r2", name: "Riya", context: "Went with friends", score: 4, body: "Another sample review, a little shorter." },
      ],
    },
    tags: ["sample"],
    content: {
      pitch: "A sample one-liner that opens the story.",
      priceNarrative: "Sample price note.",
      priceUnit: "per person",
      format: "trip",
      meetingPoint: "Sample meeting point",
      durationLabel: "1 hr 30 mins",
      additionalInfo: "Sample additional information.",
      termsDetail: "Sample terms detail.",
      fitnessLevel: "Easy",
      instructorRatio: "1 instructor for 4 guests",
      healthAdvisory: "Sample health advisory: check with a doctor if unsure.",
      carry: ["Sunscreen", "A towel", "A change of clothes"],
      knowBeforeYouGo: ["Arrive 15 minutes early.", "Wear shoes you can get wet."],
      included: ["Equipment", "A guide"],
      notIncluded: ["Food and drinks"],
      phones: ["+910000000000"],
      faqs: [
        { q: "Sample question one?", a: "A sample answer that shows how an opened question looks." },
        { q: "Sample question two?", a: "Another sample answer." },
      ],
      steps: [
        { marker: "1.", title: "Find it on discovr", caption: "You're here already" },
        { marker: "2.", title: "Call and book your slot", caption: "Call the host directly" },
        { marker: "3.", title: "Show up", caption: "Arrive on time" },
      ],
      packages: [
        { name: "Starter", price: "1500", detail: "One session" },
        { name: "Full day", price: "3000", detail: "Two sessions and lunch" },
      ],
      storyPhotos: [
        { src: "/demo/kayak-night.png", alt: "Sample story photo", caption: "A caption" },
        { src: "/demo/setting-off.png", alt: "Another sample story photo" },
      ],
      links: {
        maps: { url: "https://maps.google.com" },
        instagram: { url: "https://www.instagram.com/samplehost/" },
        website: { url: "https://example.com" },
        whatsapp: { url: "https://wa.me/910000000000" },
      },
      bookVia: "call",
    },
  };
}
