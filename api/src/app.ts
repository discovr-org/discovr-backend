import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import Fastify from "fastify";
import { registerRoutes, type HttpDeps } from "./http/routes.js";

export async function buildApp(deps: HttpDeps, corsOrigins: string[]) {
  const app = Fastify({ logger: true });
  await app.register(cors, {
    origin: corsOrigins,
    methods: ["GET", "HEAD", "OPTIONS", "PATCH", "DELETE", "POST"],
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
