import { createAdminClient } from "@supabase/server/core";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Secret-key client (bypasses RLS). Env must already be loaded. */
export function createSupabaseAdmin(): SupabaseClient {
  return createAdminClient();
}
