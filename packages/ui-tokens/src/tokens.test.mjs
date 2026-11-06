import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("ui-tokens defines required mobile-first breakpoints (360, 768, 1024, 1280) and themes", () => {
  const indexContent = fs.readFileSync(path.join(__dirname, "index.ts"), "utf8");
  assert.match(indexContent, /xs:\s*360/);
  assert.match(indexContent, /md:\s*768/);
  assert.match(indexContent, /lg:\s*1024/);
  assert.match(indexContent, /xl:\s*1280/);
  assert.match(indexContent, /outExpo/);
});
