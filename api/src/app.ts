import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import { registerRoutes, type HttpDeps } from "./http/routes.js";

export async function buildApp(deps: HttpDeps, corsOrigins: string[]) {
  const app = Fastify({ logger: true, trustProxy: true });
  await app.register(cors, {
    origin: corsOrigins,
    methods: ["GET", "HEAD", "OPTIONS", "PATCH", "PUT", "DELETE", "POST"],
  });
  // ponytail: counters live in this process. With N instances the real cap is N x max;
  // add a shared store (Redis) if abuse shows up.
  await app.register(rateLimit, {
    max: 300,
    timeWindow: "1 minute",
    errorResponseBuilder: (_req, ctx) => ({
      statusCode: ctx.statusCode,
      error: { code: "rate_limited", message: "Too many tries. Wait a bit and try again." },
    }),
  });
  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: 1,
    },
  });
  await registerRoutes(app, deps);
  return app;
}
