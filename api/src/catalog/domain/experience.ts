/** Domain models for catalog. No HTTP / DB types here. */

export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
export type WeekSchedule = Partial<Record<Weekday, string[]>>;

export type Photo = {
  src: string;
  alt: string;
};

export type Host = {
  businessName: string;
  personName: string;
  phone: string;
  instagramHandle?: string;
  avatar?: Photo;
  verified: boolean;
  experienceCount?: number;
  languages: string[];
};

export type Price = {
  fromAmount: number;
  paidTo: string;
  askForPrice?: boolean;
};

export type Place = {
  name: string;
  neighborhood: string;
  lat: number;
  lng: number;
};

export type IncludedItem = {
  included: boolean;
  title: string;
  detail?: string;
  detailTone?: "positive";
};

export type MenuPage = {
  src: string;
  label: string;
  alt: string;
};

export type Policy = {
  summary: string;
  booking: string[];
  cancellation: string[];
};

export type Review = {
  id: string;
  name: string;
  context: string;
  score: number;
  body: string;
  avatarSrc?: string;
};

export type ReviewsSummary = {
  average: number;
  count: number;
  distribution: [number, number, number, number, number];
  items: Review[];
};

export type ExperienceStatus = "draft" | "published" | "archived";

export type ContentLink = {
  label: string;
  url: string;
};

/** Hybrid bag from research sheets — extra fields that are not first-class columns. */
export type ExperienceContent = {
  aka?: string;
  locationLabel?: string;
  priceNarrative?: string;
  priceUnit?: string;
  meetingPoint?: string;
  droppingPoint?: string;
  durationLabel?: string;
  additionalInfo?: string;
  termsDetail?: string;
  whatToCarry?: string;
  included?: string[];
  notIncluded?: string[];
  phones?: string[];
  languages?: string[];
  maxPeople?: string;
  distance?: string;
  difficulty?: string;
  tagsOnDisplay?: string[];
  faqs?: Array<{ q: string; a: string }>;
  links?: {
    maps?: ContentLink;
    book?: ContentLink;
    whatsapp?: ContentLink;
    instagram?: ContentLink;
    menu?: ContentLink;
  };
};

export type Experience = {
  id: string;
  slug: string;
  title: string;
  host: Host;
  photos: Photo[];
  verdict: string;
  price: Price;
  place: Place;
  schedule: WeekSchedule;
  durationMinutes: number;
  groupSizeLabel: string;
  about: string;
  included: IncludedItem[];
  menu?: { pages: MenuPage[] };
  policy?: Policy;
  reviews?: ReviewsSummary;
  tags: string[];
  content?: ExperienceContent;
};

/** Thin row for admin / index tables. */
export type ExperienceSummary = {
  id: string;
  slug: string;
  title: string;
  status: ExperienceStatus;
  verdict: string;
  priceFromInr: number;
  hostId: string;
  hostBusinessName: string;
  hostActive: boolean;
  placeNeighborhood: string;
};

export type HostSummary = {
  id: string;
  businessName: string;
  personName: string;
  phone: string;
  experienceCount: number;
  active: boolean;
  avatarUrl?: string;
  avatarAlt?: string;
};

/** Sheet-shaped schedule bag stored on experiences.schedule jsonb. */
export type ListingSchedule = {
  days?: string;
  timeSlot?: string;
  bestTime?: string;
  ageGroup?: string;
  minPeople?: string;
  durationLabel?: string;
};

/** Editable fields for admin PATCH. */
export type ExperienceAdmin = {
  id: string;
  slug: string;
  title: string;
  status: ExperienceStatus;
  verdict: string;
  about: string;
  placeName: string;
  placeNeighborhood: string;
  placeLat: number;
  placeLng: number;
  priceFromInr: number;
  durationMinutes: number;
  groupSizeMax: number;
  groupSizeLabel: string;
  hostId: string;
  hostBusinessName: string;
  coverPhotoUrl?: string;
  coverPhotoAlt?: string;
  tags: string[];
  schedule: ListingSchedule;
  policy: Policy | null;
  content: ExperienceContent;
};

export type ExperiencePatch = {
  title?: string;
  slug?: string;
  status?: ExperienceStatus;
  verdict?: string | null;
  about?: string;
  placeName?: string;
  placeNeighborhood?: string;
  placeLat?: number;
  placeLng?: number;
  priceFromInr?: number;
  durationMinutes?: number;
  groupSizeMax?: number;
  groupSizeLabel?: string;
  tags?: string[];
  schedule?: ListingSchedule;
  policy?: Policy | null;
  content?: ExperienceContent;
  coverPhotoUrl?: string | null;
  coverPhotoAlt?: string | null;
};

export type HostPatch = {
  businessName?: string;
  personName?: string;
  phone?: string;
  active?: boolean;
  avatarUrl?: string | null;
  avatarAlt?: string | null;
};

/** Create a host from admin. */
export type HostCreate = {
  businessName: string;
  personName: string;
  phone: string;
  active?: boolean;
};

/** Create a listing from admin (draft by default). */
export type ExperienceCreate = {
  title: string;
  slug?: string;
  hostId: string;
  status?: ExperienceStatus;
  verdict?: string | null;
  about?: string;
  placeName: string;
  placeNeighborhood: string;
  placeLat: number;
  placeLng: number;
  priceFromInr?: number;
  durationMinutes?: number;
  groupSizeMax?: number;
  groupSizeLabel?: string;
};

export type FeedDensity = "portrait" | "landscape";

export type FeedCard = {
  slug: string;
  title: string;
  placeLabel: string;
  imageSrc: string;
  imageAlt: string;
  priceInr?: number;
  priceAsk?: boolean;
  durationLabel?: string;
  blurb?: string;
};

export type FeedSection = {
  id: string;
  title: string;
  density: FeedDensity;
  items: FeedCard[];
};
