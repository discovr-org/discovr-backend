import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { FastifyInstance, FastifyRequest } from "fastify";
import type { AssistantService } from "../assistant/api/assistant-service.js";
import { limit } from "./rate-limits.js";
import { readBearerToken } from "./send-error.js";

const TOKEN = "discovr-internal";
const origin = (req: FastifyRequest) => `${req.protocol}://${req.host}`;

/**
 * MCP endpoint for ops' own Claude / ChatGPT, plus the OAuth handshake those apps insist on.
 * ponytail: the OAuth is a STUB. Anyone who can reach this URL gets in. Fine for internal
 * use; replace with real admin login before the URL is shared.
 */
export async function registerMcpRoutes(app: FastifyInstance, assistant: AssistantService) {
  await app.register(async (scope) => {
    // /oauth/token arrives form-encoded.
    scope.addContentTypeParser(
      "application/x-www-form-urlencoded",
      { parseAs: "string" },
      (_req, body, done) => done(null, Object.fromEntries(new URLSearchParams(body as string))),
    );

    const protectedResource = async (req: FastifyRequest) => ({
      resource: `${origin(req)}/mcp`,
      authorization_servers: [origin(req)],
    });
    scope.get("/.well-known/oauth-protected-resource", protectedResource);
    scope.get("/.well-known/oauth-protected-resource/mcp", protectedResource);

    scope.get("/.well-known/oauth-authorization-server", async (req) => ({
      issuer: origin(req),
      authorization_endpoint: `${origin(req)}/oauth/authorize`,
      token_endpoint: `${origin(req)}/oauth/token`,
      registration_endpoint: `${origin(req)}/oauth/register`,
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      code_challenge_methods_supported: ["S256"],
      token_endpoint_auth_methods_supported: ["none"],
    }));

    scope.post<{ Body: { redirect_uris?: string[] } }>("/oauth/register", async (req, reply) =>
      reply.status(201).send({
        client_id: "discovr-internal",
        redirect_uris: req.body?.redirect_uris ?? [],
        token_endpoint_auth_method: "none",
        grant_types: ["authorization_code", "refresh_token"],
        response_types: ["code"],
      }),
    );

    // Auto-approve: bounce straight back with a code.
    scope.get<{ Querystring: { redirect_uri?: string; state?: string } }>(
      "/oauth/authorize",
      async (req, reply) => {
        const { redirect_uri, state } = req.query;
        if (!redirect_uri) return reply.status(400).send({ error: "invalid_request" });
        const url = new URL(redirect_uri);
        url.searchParams.set("code", "ok");
        if (state) url.searchParams.set("state", state);
        return reply.redirect(url.toString());
      },
    );

    scope.post("/oauth/token", async () => ({
      access_token: TOKEN,
      refresh_token: TOKEN,
      token_type: "Bearer",
      expires_in: 60 * 60 * 24 * 365,
    }));

    scope.post("/mcp", limit(120, "1 minute"), async (req, reply) => {
      // Stub check: any bearer token is accepted.
      if (!readBearerToken(req.headers.authorization)) {
        return reply
          .status(401)
          .header(
            "WWW-Authenticate",
            `Bearer resource_metadata="${origin(req)}/.well-known/oauth-protected-resource"`,
          )
          .send({ error: { code: "unauthorized", message: "Connect with OAuth." } });
      }
      const server = assistant.createServer();
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      reply.raw.on("close", () => {
        void transport.close();
        void server.close();
      });
      reply.hijack();
      await server.connect(transport);
      await transport.handleRequest(req.raw, reply.raw, req.body);
    });

    // Stateless server: no GET stream, no sessions to delete.
    const notAllowed = async (_req: FastifyRequest, reply: { status: (n: number) => { send: (b: unknown) => unknown } }) =>
      reply.status(405).send({ error: { code: "method_not_allowed", message: "Use POST." } });
    scope.get("/mcp", notAllowed);
    scope.delete("/mcp", notAllowed);
  });
}
