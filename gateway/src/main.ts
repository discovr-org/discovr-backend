import { loadConfig } from "./config.js";
import { buildGatewayApp } from "./app.js";
import { CatalogHttpClient } from "./infrastructure/catalog-http-client.js";

async function main() {
  const config = loadConfig();
  const catalog = new CatalogHttpClient(config.catalogBaseUrl);
  const app = await buildGatewayApp(catalog, config.corsOrigin);
  await app.listen({ port: config.port, host: "0.0.0.0" });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
