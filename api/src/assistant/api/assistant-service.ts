import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CatalogService } from "../../catalog/api/catalog-service.js";
import { registerTools } from "../application/tools.js";

/** Public door into the assistant module: an MCP server that drafts hosts and listings. */
export class AssistantService {
  constructor(
    private readonly catalog: CatalogService,
    private readonly adminUrl: string,
  ) {}

  /** A fresh server per request (stateless HTTP). */
  createServer(): McpServer {
    const server = new McpServer({ name: "discovr", version: "0.1.0" });
    registerTools(server, this.catalog, this.adminUrl);
    return server;
  }
}
