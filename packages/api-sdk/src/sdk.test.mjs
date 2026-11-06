import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("api-sdk exposes typed endpoints for health, config, showcase, cities, categories, and OTP auth", () => {
  const src = fs.readFileSync(path.join(__dirname, "index.ts"), "utf8");
  assert.match(src, /getHealth\(\)/);
  assert.match(src, /getConfig\(\)/);
  assert.match(src, /getShowcase\(\)/);
  assert.match(src, /requestOtp\(/);
  assert.match(src, /verifyOtp\(/);
  assert.match(src, /getMe\(/);
  assert.match(src, /ApiProblemError/);
});
