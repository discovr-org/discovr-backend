import type { FastifyInstance } from "fastify";
import type { AuthService } from "../auth/api/auth-service.js";
import type { UserService } from "../user/api/user-service.js";
import { UnauthorizedError, ValidationError } from "../shared/errors.js";
import { readBearerToken, sendApiError } from "./send-error.js";

export function registerUserRoutes(
  app: FastifyInstance,
  deps: { auth: AuthService; users: UserService },
) {
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
  const user = await auth.me(sessionId);
  return user.id;
}
