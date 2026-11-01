import { formatDuration } from "../../application/format.js";
import type { Experience, FeedSection } from "../../domain/experience.js";

/** API DTOs shaped for the PWA (duration string, place without neighborhood field leak). */

export function presentExperience(e: Experience) {
  return {
    slug: e.slug,
    title: e.title,
    host: e.host,
    photos: e.photos,
    verdict: e.verdict,
    price: e.price,
    place: {
      name: e.place.name,
      lat: e.place.lat,
      lng: e.place.lng,
    },
    schedule: e.schedule,
    duration: formatDuration(e.durationMinutes),
    groupSize: e.groupSizeLabel,
    about: e.about,
    included: e.included,
    menu: e.menu,
    policy: e.policy,
    reviews: e.reviews,
    tags: e.tags,
  };
}

export function presentFeed(sections: FeedSection[]) {
  return { sections };
}
