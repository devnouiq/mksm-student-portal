/*
  Writes backend/openapi.json to disk — for committing, or importing into
  Postman / Insomnia / Bruno. The same spec is served live at /api/openapi.json.

  Usage: tsx scripts/gen-openapi.ts
*/
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildOpenApi, CATALOG_COUNT } from "../src/lib/openapi.ts";

const out = resolve(import.meta.dirname, "../openapi.json");
writeFileSync(out, JSON.stringify(buildOpenApi(), null, 2) + "\n");
console.log(`Wrote ${out} (${CATALOG_COUNT} endpoints).`);
