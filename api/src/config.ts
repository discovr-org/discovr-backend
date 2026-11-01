import { z } from "zod";

const schema = z.object({
  port: z.coerce.number().int().positive().default(8080),
  corsOrigins: z.array(z.string().url()).min(1),
  catalogDataSource: z.enum(["memory", "supabase"]).default("memory"),
  authDataSource: z.enum(["memory", "supabase"]).optional(),
  supabaseUrl: z.string().url().optional(),
  supabaseSecretKey: z.string().min(1).optional(),
  supabasePublishableKey: z.string().min(1).optional(),
  supabaseJwksUrl: z.string().url().optional(),
  cloudflareToken: z.string().min(1).optional(),
  cloudflareEmail: z.string().email().optional(),
  cloudflareAccountId: z.string().min(1).optional(),
  twilioAccountSid: z.string().min(1).optional(),
  twilioAuthToken: z.string().min(1).optional(),
  twilioFromNumber: z.string().min(1).optional(),
});

export type ApiConfig = z.infer<typeof schema>;

function parseCorsOrigins(raw: string | undefined): string[] {
  const value =
    raw ?? "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001";
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ApiConfig {
  const parsed = schema.safeParse({
    port: env.API_PORT ?? env.GATEWAY_PORT ?? 8080,
    corsOrigins: parseCorsOrigins(env.CORS_ORIGIN),
    catalogDataSource: env.CATALOG_DATA_SOURCE ?? "memory",
    authDataSource: env.AUTH_DATA_SOURCE || undefined,
    supabaseUrl: env.SUPABASE_URL,
    supabaseSecretKey: env.SUPABASE_SECRET_KEY,
    supabasePublishableKey: env.SUPABASE_PUBLISHABLE_KEY,
    supabaseJwksUrl: env.SUPABASE_JWKS_URL,
    cloudflareToken: env.CLOUDFLARE_TOKEN || undefined,
    cloudflareEmail: env.CLOUDFLARE_EMAIL || undefined,
    cloudflareAccountId: env.CLOUDFLARE_ACCOUNT_ID || undefined,
    twilioAccountSid: env.TWILIO_ACCOUNT_SID || undefined,
    twilioAuthToken: env.TWILIO_AUTH_TOKEN || undefined,
    twilioFromNumber: env.TWILIO_FROM_NUMBER || undefined,
  });
  if (!parsed.success) {
    throw new Error(`Invalid api config: ${parsed.error.message}`);
  }
  const config = parsed.data;
  if (config.catalogDataSource === "supabase") {
    if (!config.supabaseUrl || !config.supabaseSecretKey) {
      throw new Error(
        "SUPABASE_URL and SUPABASE_SECRET_KEY are required when CATALOG_DATA_SOURCE=supabase",
      );
    }
  }
  if (
    config.cloudflareToken?.startsWith("cfk_") &&
    !config.cloudflareEmail
  ) {
    console.warn(
      "CLOUDFLARE_TOKEN is a Global API Key (cfk_). Set CLOUDFLARE_EMAIL for uploads, or use an Images API token instead.",
    );
  }
  const twilioBits = [
    config.twilioAccountSid,
    config.twilioAuthToken,
    config.twilioFromNumber,
  ];
  const twilioSet = twilioBits.filter(Boolean).length;
  if (twilioSet > 0 && twilioSet < 3) {
    console.warn(
      "Twilio SMS needs TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER together.",
    );
  }
  return config;
}
