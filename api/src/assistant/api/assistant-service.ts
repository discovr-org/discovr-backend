import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { CatalogService } from "../../catalog/api/catalog-service.js";
import { FIELD_GUIDE } from "../application/field-guide.js";
import type { PlaceFinder } from "../application/ports/place-finder.js";
import { registerTools } from "../application/tools.js";

/** Public door into the assistant module: an MCP server that drafts and edits hosts and listings. */
export class AssistantService {
  constructor(
    private readonly catalog: CatalogService,
    private readonly places: PlaceFinder,
    private readonly adminUrl: string,
  ) {}

  /** A fresh server per request (stateless HTTP). */
  createServer(): McpServer {
    const server = new McpServer({ name: "discovr", version: "0.2.0" }, { instructions: FIELD_GUIDE });
    registerTools(server, this.catalog, this.places, this.adminUrl);
    server.registerPrompt(
      "new_listing",
      {
        title: "New listing from a brief",
        description: "Paste everything you have. The AI sorts it and makes a draft host and listing.",
        argsSchema: { brief: z.string().describe("Everything you know: host, place, price, hours, FAQs, links.") },
      },
      ({ brief }) => ({
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `${FIELD_GUIDE}\n\n---\nHere is the brief. Make the host (if new) and the listing as drafts.\n\n${brief}`,
            },
          },
        ],
      }),
    );
    return server;
  }
}
