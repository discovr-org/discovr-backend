// Run: npx tsx scripts/check-assistant.ts
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { parseMapsCoords } from "../src/assistant/domain/maps-link.js";
import { AssistantService } from "../src/assistant/api/assistant-service.js";
import { CatalogService } from "../src/catalog/api/catalog-service.js";
import { MemoryExperienceRepository } from "../src/catalog/infrastructure/memory/experience-repository.js";

const memory = new MemoryExperienceRepository();
const catalog = new CatalogService(memory, memory);
const server = new AssistantService(
  catalog,
  { find: async (q) => [{ name: q, address: "fake", lat: 15.5, lng: 73.7 }] },
  "http://admin",
).createServer();
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
// maps links
assert.deepEqual(parseMapsCoords("https://www.google.com/maps/place/X/@15.58,73.74,17z/data=!3d15.5812!4d73.7411"), { lat: 15.5812, lng: 73.7411 });
assert.deepEqual(parseMapsCoords("https://maps.google.com/?q=15.1,74.2"), { lat: 15.1, lng: 74.2 });
assert.equal(parseMapsCoords("https://maps.app.goo.gl/abc"), null);
assert.match((await call("find_place", { query: "Britto" })).body, /15.5/);

// update merges, never wipes
const up = await call("update_listing", { id: saved.id, content: { pitch: "New pitch", links: { book: { url: "https://x.in" } } }, schedule: { bestTime: "Dusk" } });
assert.ok(!up.error, up.body);
const after = await catalog.getAdminExperienceById(saved.id);
assert.equal(after.content.pitch, "New pitch");
assert.equal(after.content.faqs?.[0].q, "Safe?"); // kept
assert.equal(after.schedule.timeSlot, "5pm"); // kept
assert.equal(after.schedule.bestTime, "Dusk");

// publish needs a verdict; with one it works; attention list reflects gaps
assert.ok((await call("set_listing_status", { id: saved.id, status: "published" })).error);
await call("update_listing", { id: saved.id, verdict: "Best sunset paddle in south Goa." });
assert.ok(!(await call("set_listing_status", { id: saved.id, status: "published" })).error);
assert.match((await call("needs_attention", {})).body, /no photo/);
assert.ok(!(await call("set_host_active", { id: hostId, active: true })).error);
assert.ok(!(await call("update_host", { id: hostId, phone: "+919811111111" })).error);

const prompts = await client.listPrompts();
assert.equal(prompts.prompts[0].name, "new_listing");
assert.match(client.getInstructions() ?? "", /ask|DRAFT/);
console.log("ok");
process.exit(0);
