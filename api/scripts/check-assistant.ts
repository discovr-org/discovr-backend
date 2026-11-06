// Run: npx tsx scripts/check-assistant.ts
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { AssistantService } from "../src/assistant/api/assistant-service.js";
import { CatalogService } from "../src/catalog/api/catalog-service.js";
import { MemoryExperienceRepository } from "../src/catalog/infrastructure/memory/experience-repository.js";

const memory = new MemoryExperienceRepository();
const catalog = new CatalogService(memory, memory);
const server = new AssistantService(catalog, "http://admin").createServer();
const client = new Client({ name: "check", version: "0" });
const [a, b] = InMemoryTransport.createLinkedPair();
await Promise.all([server.connect(a), client.connect(b)]);

const call = async (name: string, args: Record<string, unknown>) => {
  const r = (await client.callTool({ name, arguments: args })) as { isError?: boolean; content: Array<{ text: string }> };
  return { error: !!r.isError, body: r.content[0].text };
};

const host = await call("create_host_draft", { businessName: "Test Co", personName: "Asha", phone: "+919800000000" });
assert.ok(!host.error, host.body);
const hostId = JSON.parse(host.body).host.id;
assert.equal(JSON.parse(host.body).host.active, false);
assert.match((await call("find_hosts", { query: "test co" })).body, /Test Co/);

const bad = await call("create_listing_draft", { title: "X", hostId: "nope", placeName: "P", placeNeighborhood: "N", placeLat: 1, placeLng: 1 });
assert.ok(bad.error); // unknown host comes back as a retryable error

const ok = await call("create_listing_draft", {
  title: "Sunset Kayak", hostId, placeName: "Beach", placeNeighborhood: "Palolem", placeLat: 15, placeLng: 74,
  content: { faqs: [{ q: "Safe?", a: "Yes" }], included: ["Life jacket"] }, schedule: { timeSlot: "5pm" },
});
assert.ok(!ok.error, ok.body);
const saved = JSON.parse(ok.body);
assert.equal(saved.status, "draft");
const row = await catalog.getAdminExperienceById(saved.id);
assert.equal(row.status, "draft");
assert.equal(row.content.faqs?.[0].q, "Safe?");
assert.equal(row.schedule.timeSlot, "5pm");
console.log("ok");
process.exit(0);
