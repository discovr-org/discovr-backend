import type { FastifyInstance } from "fastify";
import type { CatalogService } from "../catalog/api/catalog-service.js";
import { sendApiError } from "./send-error.js";

type Body = { name?: unknown; slug?: unknown; layout?: unknown };

/** Categories: the page layouts listings share. Admin only (the /v1/admin gate covers them). */
export function registerCategoryRoutes(app: FastifyInstance, catalog: CatalogService) {
  app.get("/v1/admin/categories", async (_req, reply) => {
    try {
      return reply.send(await catalog.getCategories());
    } catch (err) {
      return sendApiError(reply, err);
    }
  });

  app.post<{ Body: Body }>("/v1/admin/categories", async (req, reply) => {
    try {
      return reply.status(201).send(await catalog.addCategory(req.body ?? {}));
    } catch (err) {
      return sendApiError(reply, err);
    }
  });

  app.get<{ Params: { id: string } }>("/v1/admin/categories/:id", async (req, reply) => {
    try {
      return reply.send(await catalog.getCategoryById(req.params.id));
    } catch (err) {
      return sendApiError(reply, err);
    }
  });

  app.patch<{ Params: { id: string }; Body: Body }>("/v1/admin/categories/:id", async (req, reply) => {
    try {
      return reply.send(await catalog.patchCategory(req.params.id, req.body ?? {}));
    } catch (err) {
      return sendApiError(reply, err);
    }
  });

  app.delete<{ Params: { id: string } }>("/v1/admin/categories/:id", async (req, reply) => {
    try {
      return reply.send(await catalog.removeCategory(req.params.id));
    } catch (err) {
      return sendApiError(reply, err);
    }
  });
}
