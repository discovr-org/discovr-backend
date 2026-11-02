import type {
  Experience,
  ExperienceAdmin,
  ExperienceSummary,
  ListingCard,
  HostSummary,
} from "../domain/experience.js";

/** API DTOs for the PWA. Raw data only; the PWA formats it for display. */

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
      neighborhood: e.place.neighborhood,
      lat: e.place.lat,
      lng: e.place.lng,
    },
    schedule: e.schedule,
    durationMinutes: e.durationMinutes,
    groupSize: e.groupSizeLabel,
    about: e.about,
    included: e.included,
    menu: e.menu,
    policy: e.policy,
    reviews: e.reviews,
    tags: e.tags,
    content: e.content ?? {},
  };
}

export function presentCards(cards: ListingCard[]) {
  return { cards };
}

export function presentExperienceSummaries(rows: ExperienceSummary[]) {
  return {
    experiences: rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      status: r.status,
      verdict: r.verdict,
      priceFromInr: r.priceFromInr,
      hostId: r.hostId,
      hostBusinessName: r.hostBusinessName,
      hostActive: r.hostActive,
      placeNeighborhood: r.placeNeighborhood,
    })),
  };
}

export function presentHostSummaries(rows: HostSummary[]) {
  return {
    hosts: rows.map((r) => ({
      id: r.id,
      businessName: r.businessName,
      personName: r.personName,
      phone: r.phone,
      experienceCount: r.experienceCount,
      active: r.active,
      avatarUrl: r.avatarUrl,
      avatarAlt: r.avatarAlt,
    })),
  };
}

export function presentExperienceAdmin(row: ExperienceAdmin) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status,
    verdict: row.verdict,
    about: row.about,
    placeName: row.placeName,
    placeNeighborhood: row.placeNeighborhood,
    placeLat: row.placeLat,
    placeLng: row.placeLng,
    priceFromInr: row.priceFromInr,
    durationMinutes: row.durationMinutes,
    groupSizeMax: row.groupSizeMax,
    groupSizeLabel: row.groupSizeLabel,
    hostId: row.hostId,
    hostBusinessName: row.hostBusinessName,
    coverPhotoUrl: row.coverPhotoUrl,
    coverPhotoAlt: row.coverPhotoAlt,
    tags: row.tags,
    schedule: row.schedule,
    policy: row.policy,
    content: row.content,
  };
}

export function presentHostSummary(row: HostSummary) {
  return {
    id: row.id,
    businessName: row.businessName,
    personName: row.personName,
    phone: row.phone,
    experienceCount: row.experienceCount,
    active: row.active,
    avatarUrl: row.avatarUrl,
    avatarAlt: row.avatarAlt,
  };
}
