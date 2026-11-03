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
  r2AccessKeyId: z.string().min(1).optional(),
  r2SecretAccessKey: z.string().min(1).optional(),
  r2Bucket: z.string().min(1).optional(),
  r2PublicUrl: z.string().url().optional(),
  twilioAccountSid: z.string().min(1).optional(),
  twilioAuthToken: z.string().min(1).optional(),
  twilioFromNumber: z.string().min(1).optional(),
});

export type ApiConfig = z.infer<typeof schema>;

function parseCorsOrigins(raw: string | undefined): string[] {
  const value =
    raw ??
    "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001,https://discovr-admin.vercel.app,https://discovr-frontend-phi.vercel.app";
  return value
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

/** "img.discovr.in" → "https://img.discovr.in"; the dashboard copies domains without a scheme. */
function withScheme(raw: string | undefined): string | undefined {
  const value = raw?.trim();
  if (!value) return undefined;
  return /^https?:\/\//.test(value) ? value : `https://${value}`;
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
    r2AccessKeyId: env.R2_ACCESS_KEY_ID || undefined,
    r2SecretAccessKey: env.R2_SECRET_ACCESS_KEY || undefined,
    r2Bucket: env.R2_BUCKET || undefined,
    r2PublicUrl: withScheme(env.R2_PUBLIC_URL),
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
  const r2Bits = [
    config.cloudflareAccountId,
    config.r2AccessKeyId,
    config.r2SecretAccessKey,
    config.r2Bucket,
    config.r2PublicUrl,
  ];
  const r2Set = r2Bits.slice(1).filter(Boolean).length;
  if (r2Set > 0 && r2Bits.filter(Boolean).length < r2Bits.length) {
    console.warn(
      "R2 uploads need CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, and R2_PUBLIC_URL together.",
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
