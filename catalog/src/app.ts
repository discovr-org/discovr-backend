import Fastify from "fastify";
import type { CatalogHttpDeps } from "./infrastructure/http/routes.js";
import { registerCatalogRoutes } from "./infrastructure/http/routes.js";

export async function buildCatalogApp(deps: CatalogHttpDeps) {
  const app = Fastify({ logger: true });
  await registerCatalogRoutes(app, deps);
  return app;
}
