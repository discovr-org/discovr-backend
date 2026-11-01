import { z } from "zod";

const schema = z.object({
  port: z.coerce.number().int().positive().default(8080),
  catalogBaseUrl: z.string().url().default("http://127.0.0.1:18081"),
  corsOrigin: z.string().default("http://localhost:3000"),
});

export type GatewayConfig = z.infer<typeof schema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): GatewayConfig {
  const parsed = schema.safeParse({
    port: env.GATEWAY_PORT ?? 8080,
    catalogBaseUrl: env.CATALOG_BASE_URL ?? "http://127.0.0.1:8081",
    corsOrigin: env.CORS_ORIGIN ?? "http://localhost:3000",
  });
  if (!parsed.success) {
    throw new Error(`Invalid gateway config: ${parsed.error.message}`);
  }
  return parsed.data;
}
