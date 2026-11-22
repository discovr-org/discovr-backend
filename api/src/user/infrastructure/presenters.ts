import { addDays, todayIst } from "../../shared/ist.js";
import type { UserSave } from "../application/ports/save-repository.js";
import type { User } from "../domain/user.js";

export function presentUser(user: User) {
  return {
    id: user.id,
    phone: user.phoneE164,
    name: user.name,
    createdAt: user.createdAt,
    trip: user.trip,
  };
}

export type PresentedUser = ReturnType<typeof presentUser>;

export function presentSave(row: UserSave) {
  return {
    slug: row.experienceSlug,
    createdAt: row.createdAt,
  };
}

const first = (name: string | null) => name?.trim().split(/\s+/)[0] || "there";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayLabel = (iso: string) => `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`;

/** What ops see for one person, plus the values a message template can use. */
export function presentContact(user: User, today = todayIst()) {
  const lastDay = user.trip?.status === "date" ? user.trip.lastDay : null;
  const daysLeft = lastDay ? Math.round((Date.parse(lastDay) - Date.parse(today)) / 86_400_000) : null;
  const p = user.phoneE164;
  return {
    id: user.id,
    name: user.name,
    phoneMasked: p.length > 7 ? `${p.slice(0, 3)} ${p.slice(3, 5)}••••${p.slice(-3)}` : "••••",
    signedUpAt: user.createdAt,
    tripStatus: user.trip?.status ?? null,
    lastDay,
    /** Template variables by name. Every template lists which of these fill its {{1}}, {{2}}... */
    values: {
      firstName: first(user.name),
      lastDay: lastDay ? dayLabel(lastDay) : "your last day",
      daysLeft: daysLeft === null ? "" : String(daysLeft),
    } as Record<string, string>,
  };
}
