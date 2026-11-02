import type { FastifyInstance } from "fastify";
import type { AuthService } from "../auth/api/auth-service.js";
import type { CatalogService } from "../catalog/api/catalog-service.js";
import type {
  ExperienceCreate,
  ExperiencePatch,
  ExperienceStatus,
  HostCreate,
  HostPatch,
} from "../catalog/domain/experience.js";
import type { UserService } from "../user/api/user-service.js";
import { ValidationError } from "../shared/errors.js";
import { registerAuthRoutes } from "./auth-routes.js";
import { registerUserRoutes } from "./user-routes.js";
import { sendApiError } from "./send-error.js";

export type HttpDeps = {
  catalog: CatalogService;
  auth: AuthService;
  users: UserService;
};

/**
 * Public HTTP surface. Calls module APIs only — never use-cases or Supabase.
 */
export async function registerRoutes(app: FastifyInstance, deps: HttpDeps) {
  app.get("/health", async () => ({ ok: true, service: "api" }));

  registerAuthRoutes(app, deps.auth);
  registerUserRoutes(app, { auth: deps.auth, users: deps.users });

  app.get("/v1/catalog/feed", async (_req, reply) => {
    const body = await deps.catalog.getFeed();
    return reply.send(body);
  });

  app.get("/v1/catalog/experiences", async (_req, reply) => {
    const body = await deps.catalog.getExperiences();
    return reply.send(body);
  });

  app.get("/v1/catalog/hosts", async (_req, reply) => {
    const body = await deps.catalog.getHosts();
    return reply.send(body);
  });

  app.get<{ Params: { slug: string } }>(
    "/v1/catalog/experiences/:slug",
    async (req, reply) => {
      try {
        const body = await deps.catalog.getExperienceBySlug(req.params.slug);
        return reply.send(body);
      } catch (err) {
        return sendApiError(reply, err);
      }
    },
  );

  app.post<{ Body: ExperienceCreate }>(
    "/v1/admin/experiences",
    async (req, reply) => {
      try {
        const body = await deps.catalog.addExperience(
          sanitizeExperienceCreate(req.body ?? {}),
        );
        return reply.status(201).send(body);
      } catch (err) {
        return sendApiError(reply, err);
      }
    },
  );

  app.get<{ Params: { id: string } }>(
    "/v1/admin/experiences/:id",
    async (req, reply) => {
      try {
        const body = await deps.catalog.getAdminExperienceById(req.params.id);
        return reply.send(body);
      } catch (err) {
        return sendApiError(reply, err);
      }
    },
  );

  app.patch<{ Params: { id: string }; Body: ExperiencePatch }>(
    "/v1/admin/experiences/:id",
    async (req, reply) => {
      try {
        const patch = sanitizeExperiencePatch(req.body ?? {});
        const body = await deps.catalog.patchExperience(req.params.id, patch);
        return reply.send(body);
      } catch (err) {
        return sendApiError(reply, err);
      }
    },
  );

  app.delete<{ Params: { id: string } }>(
    "/v1/admin/experiences/:id",
    async (req, reply) => {
      try {
        const body = await deps.catalog.removeExperience(req.params.id);
        return reply.send(body);
      } catch (err) {
        return sendApiError(reply, err);
      }
    },
  );

  app.post<{ Params: { id: string } }>(
    "/v1/admin/experiences/:id/cover",
    async (req, reply) => {
      try {
        const file = await req.file();
        if (!file) {
          throw new ValidationError("Attach an image file.");
        }
        const bytes = await file.toBuffer();
        const altField = (file.fields as Record<string, { value?: string }>)
          ?.alt?.value;
        const body = await deps.catalog.uploadCover(req.params.id, {
          bytes,
          filename: file.filename || "cover.jpg",
          contentType: file.mimetype || "application/octet-stream",
          alt: typeof altField === "string" ? altField : undefined,
        });
        return reply.send(body);
      } catch (err) {
        return sendApiError(reply, err);
      }
    },
  );

  app.post<{ Body: HostCreate }>(
    "/v1/admin/hosts",
    async (req, reply) => {
      try {
        const body = await deps.catalog.addHost(
          sanitizeHostCreate(req.body ?? {}),
        );
        return reply.status(201).send(body);
      } catch (err) {
        return sendApiError(reply, err);
      }
    },
  );

  app.post<{ Params: { id: string } }>(
    "/v1/admin/hosts/:id/avatar",
    async (req, reply) => {
      try {
        const file = await req.file();
        if (!file) {
          throw new ValidationError("Attach an image file.");
        }
        const bytes = await file.toBuffer();
        const altField = (file.fields as Record<string, { value?: string }>)
          ?.alt?.value;
        const body = await deps.catalog.uploadAvatar(req.params.id, {
          bytes,
          filename: file.filename || "avatar.jpg",
          contentType: file.mimetype || "application/octet-stream",
          alt: typeof altField === "string" ? altField : undefined,
        });
        return reply.send(body);
      } catch (err) {
        return sendApiError(reply, err);
      }
    },
  );

  app.patch<{ Params: { id: string }; Body: HostPatch }>(
    "/v1/admin/hosts/:id",
    async (req, reply) => {
      try {
        const patch = sanitizeHostPatch(req.body ?? {});
        const body = await deps.catalog.patchHost(req.params.id, patch);
        return reply.send(body);
      } catch (err) {
        return sendApiError(reply, err);
      }
    },
  );

  app.delete<{ Params: { id: string } }>(
    "/v1/admin/hosts/:id",
    async (req, reply) => {
      try {
        const body = await deps.catalog.removeHost(req.params.id);
        return reply.send(body);
      } catch (err) {
        return sendApiError(reply, err);
      }
    },
  );
}

function sanitizeExperiencePatch(body: ExperiencePatch): ExperiencePatch {
  const patch: ExperiencePatch = {};
  if (typeof body.title === "string") patch.title = body.title;
  if (typeof body.slug === "string") patch.slug = body.slug;
  if (isStatus(body.status)) patch.status = body.status;
  if (body.verdict === null) patch.verdict = null;
  else if (typeof body.verdict === "string") patch.verdict = body.verdict;
  if (typeof body.about === "string") patch.about = body.about;
  if (typeof body.placeName === "string") patch.placeName = body.placeName;
  if (typeof body.placeNeighborhood === "string") {
    patch.placeNeighborhood = body.placeNeighborhood;
  }
  if (typeof body.placeLat === "number") patch.placeLat = body.placeLat;
  if (typeof body.placeLng === "number") patch.placeLng = body.placeLng;
  if (typeof body.priceFromInr === "number") {
    patch.priceFromInr = Math.round(body.priceFromInr);
  }
  if (typeof body.durationMinutes === "number") {
    patch.durationMinutes = Math.round(body.durationMinutes);
  }
  if (typeof body.groupSizeMax === "number") {
    patch.groupSizeMax = Math.round(body.groupSizeMax);
  }
  if (typeof body.groupSizeLabel === "string") {
    patch.groupSizeLabel = body.groupSizeLabel;
  }
  if (Array.isArray(body.tags)) {
    patch.tags = body.tags
      .filter((t): t is string => typeof t === "string")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  if (body.schedule && typeof body.schedule === "object") {
    patch.schedule = sanitizeSchedule(body.schedule);
  }
  if (body.policy === null) patch.policy = null;
  else if (body.policy && typeof body.policy === "object") {
    patch.policy = sanitizePolicy(body.policy);
  }
  if (body.content && typeof body.content === "object") {
    patch.content = body.content;
  }
  if (body.coverPhotoUrl === null) patch.coverPhotoUrl = null;
  else if (typeof body.coverPhotoUrl === "string") {
    patch.coverPhotoUrl = body.coverPhotoUrl;
  }
  if (body.coverPhotoAlt === null) patch.coverPhotoAlt = null;
  else if (typeof body.coverPhotoAlt === "string") {
    patch.coverPhotoAlt = body.coverPhotoAlt;
  }
  return patch;
}

function sanitizeSchedule(
  value: NonNullable<ExperiencePatch["schedule"]>,
): NonNullable<ExperiencePatch["schedule"]> {
  const out: NonNullable<ExperiencePatch["schedule"]> = {};
  if (typeof value.days === "string") out.days = value.days;
  if (typeof value.timeSlot === "string") out.timeSlot = value.timeSlot;
  if (typeof value.bestTime === "string") out.bestTime = value.bestTime;
  if (typeof value.ageGroup === "string") out.ageGroup = value.ageGroup;
  if (typeof value.minPeople === "string") out.minPeople = value.minPeople;
  if (typeof value.durationLabel === "string") {
    out.durationLabel = value.durationLabel;
  }
  return out;
}

function sanitizePolicy(
  value: NonNullable<ExperiencePatch["policy"]>,
): NonNullable<ExperiencePatch["policy"]> {
  return {
    summary: typeof value.summary === "string" ? value.summary : "",
    booking: Array.isArray(value.booking)
      ? value.booking.filter((line): line is string => typeof line === "string")
      : [],
    cancellation: Array.isArray(value.cancellation)
      ? value.cancellation.filter(
          (line): line is string => typeof line === "string",
        )
      : [],
  };
}

function sanitizeHostPatch(body: HostPatch): HostPatch {
  const patch: HostPatch = {};
  if (typeof body.businessName === "string") {
    patch.businessName = body.businessName;
  }
  if (typeof body.personName === "string") patch.personName = body.personName;
  if (typeof body.phone === "string") patch.phone = body.phone;
  if (typeof body.active === "boolean") patch.active = body.active;
  if (body.avatarUrl === null) patch.avatarUrl = null;
  else if (typeof body.avatarUrl === "string") patch.avatarUrl = body.avatarUrl;
  if (body.avatarAlt === null) patch.avatarAlt = null;
  else if (typeof body.avatarAlt === "string") patch.avatarAlt = body.avatarAlt;
  return patch;
}

function sanitizeHostCreate(body: HostCreate): HostCreate {
  return {
    businessName:
      typeof body.businessName === "string" ? body.businessName : "",
    personName: typeof body.personName === "string" ? body.personName : "",
    phone: typeof body.phone === "string" ? body.phone : "",
    active: typeof body.active === "boolean" ? body.active : true,
  };
}

function sanitizeExperienceCreate(body: ExperienceCreate): ExperienceCreate {
  return {
    title: typeof body.title === "string" ? body.title : "",
    slug: typeof body.slug === "string" ? body.slug : undefined,
    hostId: typeof body.hostId === "string" ? body.hostId : "",
    status: isStatus(body.status) ? body.status : "draft",
    verdict:
      body.verdict === null
        ? null
        : typeof body.verdict === "string"
          ? body.verdict
          : undefined,
    about: typeof body.about === "string" ? body.about : undefined,
    placeName: typeof body.placeName === "string" ? body.placeName : "",
    placeNeighborhood:
      typeof body.placeNeighborhood === "string"
        ? body.placeNeighborhood
        : "",
    placeLat: typeof body.placeLat === "number" ? body.placeLat : Number.NaN,
    placeLng: typeof body.placeLng === "number" ? body.placeLng : Number.NaN,
    priceFromInr:
      typeof body.priceFromInr === "number"
        ? Math.round(body.priceFromInr)
        : undefined,
    durationMinutes:
      typeof body.durationMinutes === "number"
        ? Math.round(body.durationMinutes)
        : undefined,
    groupSizeMax:
      typeof body.groupSizeMax === "number"
        ? Math.round(body.groupSizeMax)
        : undefined,
    groupSizeLabel:
      typeof body.groupSizeLabel === "string"
        ? body.groupSizeLabel
        : undefined,
  };
}

function isStatus(value: unknown): value is ExperienceStatus {
  return value === "draft" || value === "published" || value === "archived";
}
