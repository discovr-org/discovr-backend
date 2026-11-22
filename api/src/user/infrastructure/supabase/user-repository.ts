import type { SupabaseClient } from "@supabase/supabase-js";
import type { Trip, TripStatus, User } from "../../domain/user.js";
import { addDays, startOfDayIst, todayIst } from "../../../shared/ist.js";
import type { UserFilter, UserRepository } from "../../application/ports/user-repository.js";

const COLUMNS = "id, phone_e164, name, created_at, trip_status, trip_last_day, trip_ask_again_on";

export class SupabaseUserRepository implements UserRepository {
  constructor(private readonly db: SupabaseClient) {}

  async list(filter: UserFilter, limit: number): Promise<User[]> {
    let q = this.db.from("users").select(COLUMNS).order("created_at", { ascending: false }).limit(limit);
    if (filter.signedUpFrom) q = q.gte("created_at", startOfDayIst(filter.signedUpFrom));
    if (filter.signedUpTo) q = q.lt("created_at", startOfDayIst(addDays(filter.signedUpTo, 1)));
    if (filter.leavingWithinDays !== undefined) {
      const today = todayIst();
      q = q
        .eq("trip_status", "date")
        .gte("trip_last_day", today)
        .lte("trip_last_day", addDays(today, filter.leavingWithinDays));
    }
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map(mapUser);
  }

  async findByIds(ids: string[]): Promise<User[]> {
    if (!ids.length) return [];
    const { data, error } = await this.db.from("users").select(COLUMNS).in("id", ids);
    if (error) throw error;
    return (data ?? []).map(mapUser);
  }

  async findByPhone(phoneE164: string): Promise<User | null> {
    const { data, error } = await this.db
      .from("users")
      .select(COLUMNS)
      .eq("phone_e164", phoneE164)
      .maybeSingle();
    if (error) throw error;
    return data ? mapUser(data) : null;
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.db
      .from("users")
      .select(COLUMNS)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapUser(data) : null;
  }

  async create(phoneE164: string): Promise<User> {
    const { data, error } = await this.db
      .from("users")
      .insert({ phone_e164: phoneE164 })
      .select(COLUMNS)
      .single();
    if (error) throw error;
    return mapUser(data);
  }

  async updateName(id: string, name: string): Promise<User | null> {
    const { data, error } = await this.db
      .from("users")
      .update({ name, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(COLUMNS)
      .maybeSingle();
    if (error) throw error;
    return data ? mapUser(data) : null;
  }

  async updateTrip(id: string, trip: Trip): Promise<User | null> {
    const { data, error } = await this.db
      .from("users")
      .update({
        trip_status: trip.status,
        trip_last_day: trip.lastDay,
        trip_ask_again_on: trip.askAgainOn,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(COLUMNS)
      .maybeSingle();
    if (error) throw error;
    return data ? mapUser(data) : null;
  }
}

function mapUser(row: {
  id: string;
  phone_e164: string;
  name: string | null;
  created_at: string;
  trip_status: string | null;
  trip_last_day: string | null;
  trip_ask_again_on: string | null;
}): User {
  return {
    id: String(row.id),
    phoneE164: String(row.phone_e164),
    name: row.name ? String(row.name) : null,
    createdAt: String(row.created_at),
    trip: row.trip_status
      ? {
          status: row.trip_status as TripStatus,
          lastDay: row.trip_last_day ? String(row.trip_last_day) : null,
          askAgainOn: row.trip_ask_again_on ? String(row.trip_ask_again_on) : null,
        }
      : null,
  };
}
