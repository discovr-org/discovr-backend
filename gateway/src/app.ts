import cors from "@fastify/cors";
import Fastify from "fastify";
import type { CatalogClient } from "./application/ports/catalog-client.js";
import { registerGatewayRoutes } from "./infrastructure/http/routes.js";

export async function buildGatewayApp(
  catalog: CatalogClient,
  corsOrigin: string,
) {
  const app = Fastify({ logger: true });
  await app.register(cors, {
    origin: corsOrigin,
    methods: ["GET", "HEAD", "OPTIONS"],
  });
  await registerGatewayRoutes(app, catalog);
  return app;
}
