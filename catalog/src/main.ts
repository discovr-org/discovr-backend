import { GetExperience } from "./application/get-experience.js";
import { ListFeed } from "./application/list-feed.js";
import type { ExperienceRepository } from "./application/ports/experience-repository.js";
import { loadConfig } from "./config.js";
import { buildCatalogApp } from "./app.js";
import { MemoryExperienceRepository } from "./infrastructure/memory/experience-repository.js";
import { createSupabaseAdmin } from "./infrastructure/supabase/client.js";
import { SupabaseExperienceRepository } from "./infrastructure/supabase/experience-repository.js";

async function main() {
  const config = loadConfig();
  const repo = createRepository(config);
  const getExperience = new GetExperience(repo);
  const listFeed = new ListFeed(repo);

  const app = await buildCatalogApp({ getExperience, listFeed });
  await app.listen({ port: config.port, host: "0.0.0.0" });
}

function createRepository(
  config: ReturnType<typeof loadConfig>,
): ExperienceRepository {
  if (config.dataSource === "memory") {
    return new MemoryExperienceRepository();
  }
  const db = createSupabaseAdmin(
    config.supabaseUrl!,
    config.supabaseServiceRoleKey!,
  );
  return new SupabaseExperienceRepository(db);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
