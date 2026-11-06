import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("shared package defines all 21 required PRD Section 10 analytics events", () => {
  const src = fs.readFileSync(path.join(__dirname, "enums.ts"), "utf8");
  const requiredEvents = [
    "signup_completed",
    "listing_created",
    "listing_published",
    "feed_viewed",
    "item_viewed",
    "offer_sent",
    "offer_countered",
    "offer_accepted",
    "offer_rejected",
    "message_sent",
    "trade_scheduled",
    "trade_completed",
    "trade_cancelled",
    "dispute_opened",
    "review_submitted",
    "match_shown",
    "match_clicked",
    "chain_proposed",
    "chain_accepted",
    "chain_dissolved",
    "chain_completed",
  ];
  for (const ev of requiredEvents) {
    assert.ok(src.includes(`"${ev}"`), `Missing analytics event: ${ev}`);
  }
});

test("shared package defines matching score weights (0.30, 0.25, 0.20, 0.15, 0.10) and prohibited items check", () => {
  const src = fs.readFileSync(path.join(__dirname, "utilities.ts"), "utf8");
  assert.match(src, /0\.3\s*\*\s*clamp\(factors\.itemPreference\)/);
  assert.match(src, /0\.25\s*\*\s*clamp\(factors\.valueCompatibility\)/);
  assert.match(src, /0\.2\s*\*\s*clamp\(factors\.locationProximity\)/);
  assert.match(src, /0\.15\s*\*\s*clamp\(factors\.conditionCompatibility\)/);
  assert.match(src, /0\.1\s*\*\s*clamp\(factors\.userPreferences\)/);
  assert.match(src, /checkProhibitedContent/);

  const phase2Src = fs.readFileSync(path.join(__dirname, "phase2.ts"), "utf8");
  assert.match(phase2Src, /evaluatePairFactors/);
  assert.match(phase2Src, /isMutualMatch/);

  const phase3Src = fs.readFileSync(path.join(__dirname, "phase3.ts"), "utf8");
  assert.match(phase3Src, /sanitizeUntrustedListingPrompt/);
  assert.match(phase3Src, /Estimated range, not a market price/);
});

