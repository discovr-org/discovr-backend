export type TripStatus = "date" | "later" | "local" | "not_yet";

/** Their answer to "Till when are you in Goa?". Days are "YYYY-MM-DD". */
export type Trip = {
  status: TripStatus;
  lastDay: string | null;
  /** First day we may ask again. Null = never. */
  askAgainOn: string | null;
};

export type User = {
  id: string;
  phoneE164: string;
  /** First name from sign-up. Null until the name step is finished. */
  name: string | null;
  createdAt: string;
  /** Null until they answer. */
  trip: Trip | null;
};
