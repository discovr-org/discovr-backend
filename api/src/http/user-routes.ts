import type { FastifyInstance } from "fastify";
import type { AuthService } from "../auth/api/auth-service.js";
import type { UserService } from "../user/api/user-service.js";
import { UnauthorizedError, ValidationError } from "../shared/errors.js";
import { limit } from "./rate-limits.js";
import { readBearerToken, sendApiError } from "./send-error.js";

export function registerUserRoutes(
  app: FastifyInstance,
  deps: { auth: AuthService; users: UserService },
) {
  app.post<{ Body: { phone?: string; source?: string } }>(
    "/v1/trip-updates",
    limit(5),
    async (req, reply) => {
      try {
        const body = await deps.users.subscribeTripUpdates(
          req.body?.phone ?? "",
          req.body?.source,
        );
        return reply.code(201).send(body);
      } catch (err) {
        return sendApiError(reply, err);
      }
    },
  );

  app.post<{ Body: Record<string, unknown> }>("/v1/host-applications", limit(3), async (req, reply) => {
    try {
      const body = await deps.users.submitHostApplication(req.body ?? {});
      return reply.code(201).send(body);
    } catch (err) {
      return sendApiError(reply, err);
    }
  });

  app.post<{ Body: Record<string, unknown> }>("/v1/help-requests", limit(5), async (req, reply) => {
    try {
      const body = await deps.users.submitHelpRequest(req.body ?? {});
      return reply.code(201).send(body);
    } catch (err) {
      return sendApiError(reply, err);
    }
  });

  app.patch<{ Body: { name?: unknown } }>("/v1/me", async (req, reply) => {
    try {
      const userId = await requireUserId(deps.auth, req.headers.authorization);
      const name = req.body?.name;
      if (typeof name !== "string") throw new ValidationError("Add your name.");
      const user = await deps.users.setName(userId, name);
      return reply.send({ user });
    } catch (err) {
      return sendApiError(reply, err);
    }
  });

  app.get("/v1/me/saves", async (req, reply) => {
    try {
      const userId = await requireUserId(deps.auth, req.headers.authorization);
      const body = await deps.users.getSaves(userId);
      return reply.send(body);
    } catch (err) {
      return sendApiError(reply, err);
    }
  });

  app.put<{ Body: { slugs?: string[] } }>("/v1/me/saves", async (req, reply) => {
    try {
      const userId = await requireUserId(deps.auth, req.headers.authorization);
      const slugs = req.body?.slugs;
      if (!Array.isArray(slugs)) {
        throw new ValidationError("Send { \"slugs\": [\"…\"] }.");
      }
      const body = await deps.users.syncSaves(userId, slugs);
      return reply.send(body);
    } catch (err) {
      return sendApiError(reply, err);
    }
  });

  app.put<{ Params: { slug: string } }>(
    "/v1/me/saves/:slug",
    async (req, reply) => {
      try {
        const userId = await requireUserId(deps.auth, req.headers.authorization);
        const body = await deps.users.saveExperience(userId, req.params.slug);
        return reply.send(body);
      } catch (err) {
        return sendApiError(reply, err);
      }
    },
  );

  app.delete<{ Params: { slug: string } }>(
    "/v1/me/saves/:slug",
    async (req, reply) => {
      try {
        const userId = await requireUserId(deps.auth, req.headers.authorization);
        const body = await deps.users.unsaveExperience(userId, req.params.slug);
        return reply.send(body);
      } catch (err) {
        return sendApiError(reply, err);
      }
    },
  );
}

async function requireUserId(
  auth: AuthService,
  authorization: string | string[] | undefined,
): Promise<string> {
  const sessionId = readBearerToken(authorization);
  if (!sessionId) throw new UnauthorizedError();
  return auth.userIdFor(sessionId);
}
