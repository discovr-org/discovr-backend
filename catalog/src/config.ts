import { z } from "zod";

const schema = z.object({
  port: z.coerce.number().int().positive().default(18081),
  dataSource: z.enum(["memory", "supabase"]).default("memory"),
  supabaseUrl: z.string().url().optional(),
  supabaseServiceRoleKey: z.string().min(1).optional(),
});

export type CatalogConfig = z.infer<typeof schema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): CatalogConfig {
  const parsed = schema.safeParse({
    port: env.CATALOG_PORT ?? 18081,
    dataSource: env.CATALOG_DATA_SOURCE ?? "memory",
    supabaseUrl: env.SUPABASE_URL,
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  });
  if (!parsed.success) {
    throw new Error(`Invalid catalog config: ${parsed.error.message}`);
  }
  const config = parsed.data;
  if (config.dataSource === "supabase") {
    if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
      throw new Error(
        "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required when CATALOG_DATA_SOURCE=supabase",
      );
    }
  }
  return config;
}
