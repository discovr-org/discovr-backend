import { NotFoundError, ValidationError } from "../../shared/errors.js";
import type { Trip, TripStatus, User } from "../domain/user.js";
import type { UserRepository } from "./ports/user-repository.js";

export type TripEndInput = { status?: unknown; lastDay?: unknown };

const STATUSES: TripStatus[] = ["date", "later", "local", "not_yet"];
/** Days after their last day (or after answering) before we ask again. */
const ASK_AGAIN_AFTER_DAYS = 3;
/** A last day further out than this is a typo, not a trip. */
const MAX_DAYS_AHEAD = 365;
const DAY = 24 * 60 * 60 * 1000;

const isDay = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
const addDays = (day: string, n: number) => new Date(Date.parse(day) + n * DAY).toISOString().slice(0, 10);

export class SetTripEnd {
  constructor(private readonly users: UserRepository, private readonly now: () => Date = () => new Date()) {}

  async execute(id: string, input: TripEndInput): Promise<User> {
    const status = input.status as TripStatus;
    if (!STATUSES.includes(status)) throw new ValidationError("Pick one of the options.");

    const today = this.now().toISOString().slice(0, 10);
    let lastDay: string | null = null;
    if (status === "date" || status === "later") {
      if (!isDay(input.lastDay)) throw new ValidationError("Send the day as YYYY-MM-DD.");
      // One day of slack: the guest's phone can be a time zone ahead of the server.
      if (input.lastDay < addDays(today, -1) || input.lastDay > addDays(today, MAX_DAYS_AHEAD)) {
        throw new ValidationError("That day looks off.");
      }
      lastDay = input.lastDay;
    }

    const trip: Trip = {
      status,
      lastDay,
      askAgainOn: status === "local" ? null : addDays(lastDay ?? today, ASK_AGAIN_AFTER_DAYS),
    };
    const user = await this.users.updateTrip(id, trip);
    if (!user) throw new NotFoundError(`User ${id} not found`);
    return user;
  }
}
