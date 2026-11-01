import type { FastifyInstance } from "fastify";
import type { GetExperience } from "../../application/get-experience.js";
import type { ListFeed } from "../../application/list-feed.js";
import { NotFoundError } from "../../domain/errors.js";
import { presentExperience, presentFeed } from "./presenters.js";

export type CatalogHttpDeps = {
  getExperience: GetExperience;
  listFeed: ListFeed;
};

export async function registerCatalogRoutes(
  app: FastifyInstance,
  deps: CatalogHttpDeps,
) {
  app.get("/health", async () => ({ ok: true, service: "catalog" }));

  app.get("/internal/v1/feed", async (_req, reply) => {
    const sections = await deps.listFeed.execute();
    return reply.send(presentFeed(sections));
  });

  app.get<{ Params: { slug: string } }>(
    "/internal/v1/experiences/:slug",
    async (req, reply) => {
      try {
        const experience = await deps.getExperience.execute(req.params.slug);
        return reply.send(presentExperience(experience));
      } catch (err) {
        if (err instanceof NotFoundError) {
          return reply.status(404).send({
            error: { code: err.code, message: err.message },
          });
        }
        throw err;
      }
    },
  );
}
