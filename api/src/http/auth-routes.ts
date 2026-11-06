import type { FastifyInstance } from "fastify";
import type { AuthService } from "../auth/api/auth-service.js";
import { UnauthorizedError, ValidationError } from "../shared/errors.js";
import { limit } from "./rate-limits.js";
import { readBearerToken, sendApiError } from "./send-error.js";

export function registerAuthRoutes(
  app: FastifyInstance,
  auth: AuthService,
) {
  app.post<{ Body: { phone?: string } }>(
    "/v1/auth/otp/request",
    limit(5),
    async (req, reply) => {
      try {
        const phone = req.body?.phone;
        if (typeof phone !== "string") {
          throw new ValidationError("Add a phone number.");
        }
        const body = await auth.requestLoginOtp(phone);
        return reply.send(body);
      } catch (err) {
        return sendApiError(reply, err);
      }
    },
  );

  app.post<{ Body: { phone?: string; code?: string } }>(
    "/v1/auth/otp/verify",
    limit(15),
    async (req, reply) => {
      try {
        const phone = req.body?.phone;
        const code = req.body?.code;
        if (typeof phone !== "string" || typeof code !== "string") {
          throw new ValidationError("Phone and code are required.");
        }
        const body = await auth.verifyLoginOtp(phone, code);
        return reply.send(body);
      } catch (err) {
        return sendApiError(reply, err);
      }
    },
  );

  app.get("/v1/auth/me", async (req, reply) => {
    try {
      const sessionId = readBearerToken(req.headers.authorization);
      if (!sessionId) throw new UnauthorizedError();
      const user = await auth.me(sessionId);
      return reply.send({ user });
    } catch (err) {
      return sendApiError(reply, err);
    }
  });

  app.post("/v1/auth/logout", async (req, reply) => {
    try {
      const sessionId = readBearerToken(req.headers.authorization);
      const body = await auth.signOut(sessionId ?? "");
      return reply.send(body);
    } catch (err) {
      return sendApiError(reply, err);
    }
  });
}
