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
