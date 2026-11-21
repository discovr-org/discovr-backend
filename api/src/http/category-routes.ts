import type { FastifyInstance } from "fastify";
import type { CatalogService } from "../catalog/api/catalog-service.js";
import { sendApiError } from "./send-error.js";

type Body = { name?: unknown; slug?: unknown; layout?: unknown };

/** Site settings: public read, admin save. */
export function registerSiteSettingsRoutes(app: FastifyInstance, catalog: CatalogService) {
  app.get("/v1/catalog/site", async (_req, reply) => {
    try {
      return reply.send(await catalog.getSiteSettings());
    } catch (err) {
      return sendApiError(reply, err);
    }
  });

  app.put<{ Body: { settings?: unknown } }>("/v1/admin/site", async (req, reply) => {
    try {
      return reply.send(await catalog.saveSiteSettings(req.body?.settings));
    } catch (err) {
      return sendApiError(reply, err);
    }
  });
}

/** Home feed: public read, admin save (the /v1/admin gate covers the PUT). */
export function registerHomeFeedRoutes(app: FastifyInstance, catalog: CatalogService) {
  app.get("/v1/catalog/home", async (_req, reply) => {
    try {
      return reply.send(await catalog.getHomeFeed());
    } catch (err) {
      return sendApiError(reply, err);
    }
  });

  app.put<{ Body: { sections?: unknown } }>("/v1/admin/home", async (req, reply) => {
    try {
      return reply.send(await catalog.saveHomeFeed(req.body?.sections));
    } catch (err) {
      return sendApiError(reply, err);
    }
  });
}

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

  app.post<{ Params: { id: string }; Body: { layout?: unknown } }>("/v1/admin/categories/:id/preview", async (req, reply) => {
    try {
      return reply.send(await catalog.previewCategorySample(req.params.id, req.body?.layout));
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
