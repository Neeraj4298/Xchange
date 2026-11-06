import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("Mobile Phase 0 skeleton integrates @xchange/api-sdk and @xchange/ui-tokens", () => {
  const src = fs.readFileSync(path.join(__dirname, "index.ts"), "utf8");
  assert.match(src, /createXchangeApiClient/);
  assert.match(src, /uiTokens/);
});
