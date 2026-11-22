// Run: npx tsx src/catalog/domain/search-vector.check.ts
import assert from "node:assert/strict";
import { editVector, lexemes } from "./search-vector.js";

const v = "'beach':1A 'goa':2B,4C";
assert.deepEqual(lexemes(editVector(v, "add", ["Sunset Bar", "goa"])), ["beach", "goa", "sunset", "bar"]);
assert.equal(editVector(v, "add", []), v); // weights kept
assert.deepEqual(lexemes(editVector(v, "remove", ["goa"])), ["beach"]);
assert.deepEqual(lexemes(editVector(v, "replace", ["it's"])), ["it's"]);
console.log("search-vector ok");
