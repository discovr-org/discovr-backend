import type { FastifyInstance } from "fastify";
import type { CatalogClient } from "../../application/ports/catalog-client.js";

export async function registerGatewayRoutes(
  app: FastifyInstance,
  catalog: CatalogClient,
) {
  app.get("/health", async () => ({ ok: true, service: "gateway" }));

  app.get("/v1/catalog/feed", async (_req, reply) => {
    const result = await catalog.getFeed();
    return reply.status(result.status).send(result.body);
  });

  app.get<{ Params: { slug: string } }>(
    "/v1/catalog/experiences/:slug",
    async (req, reply) => {
      const result = await catalog.getExperience(req.params.slug);
      return reply.status(result.status).send(result.body);
    },
  );
}
