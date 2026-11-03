import { config as loadEnv } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { AuthService } from "./auth/api/auth-service.js";
import type { OtpRepository } from "./auth/application/ports/otp-repository.js";
import type { SessionRepository } from "./auth/application/ports/session-repository.js";
import { MemoryOtpRepository } from "./auth/infrastructure/memory/otp-repository.js";
import { MemorySessionRepository } from "./auth/infrastructure/memory/session-repository.js";
import { SupabaseOtpRepository } from "./auth/infrastructure/supabase/otp-repository.js";
import { SupabaseSessionRepository } from "./auth/infrastructure/supabase/session-repository.js";
import type { ExperienceRepository } from "./catalog/application/ports/experience-repository.js";
import type { ImageUploader } from "./catalog/application/ports/image-uploader.js";
import { CatalogService } from "./catalog/api/catalog-service.js";
import { CloudflareImagesUploader } from "./catalog/infrastructure/cloudflare/images-uploader.js";
import { R2ImageUploader } from "./catalog/infrastructure/cloudflare/r2-uploader.js";
import { MemoryExperienceRepository } from "./catalog/infrastructure/memory/experience-repository.js";
import { createSupabaseAdmin } from "./catalog/infrastructure/supabase/client.js";
import { SupabaseExperienceRepository } from "./catalog/infrastructure/supabase/experience-repository.js";
import { CommunicationService } from "./communication/api/communication-service.js";
import type { SmsSender } from "./communication/application/ports/sms-sender.js";
import { TwilioSmsSender } from "./communication/infrastructure/twilio/sms-sender.js";
import { UserService } from "./user/api/user-service.js";
import type { SaveRepository } from "./user/application/ports/save-repository.js";
import type { UserRepository } from "./user/application/ports/user-repository.js";
import { MemorySaveRepository } from "./user/infrastructure/memory/save-repository.js";
import { MemoryUserRepository } from "./user/infrastructure/memory/user-repository.js";
import { SupabaseSaveRepository } from "./user/infrastructure/supabase/save-repository.js";
import type { TripUpdateRepository } from "./user/application/ports/trip-update-repository.js";
import { MemoryTripUpdateRepository } from "./user/infrastructure/memory/trip-update-repository.js";
import { SupabaseTripUpdateRepository } from "./user/infrastructure/supabase/trip-update-repository.js";
import { SupabaseUserRepository } from "./user/infrastructure/supabase/user-repository.js";
import { buildApp } from "./app.js";
import { loadConfig, type ApiConfig } from "./config.js";
import { ValidationError } from "./shared/errors.js";

const here = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(here, "../../../.env") }); // discovr-backend/.env
loadEnv({ path: resolve(here, "../../.env"), override: true }); // api/.env wins

async function main() {
  const config = loadConfig();
  const db = config.catalogDataSource === "supabase" ? createSupabaseAdmin() : null;

  const images = createImageUploader(config);
  const catalog = new CatalogService(createCatalogRepository(config, db), images);

  const authSource = config.authDataSource ?? config.catalogDataSource;
  const users = new UserService(
    createUserRepository(authSource, db),
    createSaveRepository(authSource, db),
    createTripUpdateRepository(authSource, db),
  );
  const communication = new CommunicationService(createSmsSender(config));
  const { otps, sessions } = createAuthStores(authSource, db);
  const auth = new AuthService(otps, sessions, users, communication);

  const app = await buildApp({ catalog, auth, users }, config.corsOrigins);
  await app.listen({ port: config.port, host: "0.0.0.0" });
}

function createCatalogRepository(
  config: ApiConfig,
  db: ReturnType<typeof createSupabaseAdmin> | null,
): ExperienceRepository {
  if (config.catalogDataSource === "memory" || !db) {
    return new MemoryExperienceRepository();
  }
  return new SupabaseExperienceRepository(db);
}

function createUserRepository(
  source: "memory" | "supabase",
  db: ReturnType<typeof createSupabaseAdmin> | null,
): UserRepository {
  if (source === "memory" || !db) {
    return new MemoryUserRepository();
  }
  return new SupabaseUserRepository(db);
}

function createSaveRepository(
  source: "memory" | "supabase",
  db: ReturnType<typeof createSupabaseAdmin> | null,
): SaveRepository {
  if (source === "memory" || !db) {
    return new MemorySaveRepository();
  }
  return new SupabaseSaveRepository(db);
}

function createTripUpdateRepository(
  source: "memory" | "supabase",
  db: ReturnType<typeof createSupabaseAdmin> | null,
): TripUpdateRepository {
  if (source === "memory" || !db) {
    return new MemoryTripUpdateRepository();
  }
  return new SupabaseTripUpdateRepository(db);
}

function createAuthStores(
  source: "memory" | "supabase",
  db: ReturnType<typeof createSupabaseAdmin> | null,
): { otps: OtpRepository; sessions: SessionRepository } {
  if (source === "memory" || !db) {
    return {
      otps: new MemoryOtpRepository(),
      sessions: new MemorySessionRepository(),
    };
  }
  return {
    otps: new SupabaseOtpRepository(db),
    sessions: new SupabaseSessionRepository(db),
  };
}

function createImageUploader(config: ApiConfig): ImageUploader | null {
  const { cloudflareAccountId, r2AccessKeyId, r2SecretAccessKey, r2Bucket, r2PublicUrl } = config;
  if (cloudflareAccountId && r2AccessKeyId && r2SecretAccessKey && r2Bucket && r2PublicUrl) {
    return new R2ImageUploader({
      accountId: cloudflareAccountId,
      accessKeyId: r2AccessKeyId,
      secretAccessKey: r2SecretAccessKey,
      bucket: r2Bucket,
      publicBaseUrl: r2PublicUrl,
    });
  }
  if (!config.cloudflareToken) return null;
  return new CloudflareImagesUploader({
    token: config.cloudflareToken,
    email: config.cloudflareEmail,
    accountId: config.cloudflareAccountId,
  });
}

function createSmsSender(config: ApiConfig): SmsSender {
  if (
    config.twilioAccountSid &&
    config.twilioAuthToken &&
    config.twilioFromNumber
  ) {
    return new TwilioSmsSender({
      accountSid: config.twilioAccountSid,
      authToken: config.twilioAuthToken,
      fromNumber: config.twilioFromNumber,
    });
  }
  return {
    async send() {
      throw new ValidationError(
        "SMS isn't configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER.",
      );
    },
  };
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
