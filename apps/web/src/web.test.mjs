import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("Web Phase 0 & Phase 1 routes, middleware, 3-Way Cycle Studio, and Core Marketplace screens exist", () => {
  const requiredFiles = [
    "middleware.ts",
    "app/layout.tsx",
    "app/error.tsx",
    "app/not-found.tsx",
    "app/page.tsx",
    "app/login/page.tsx",
    "app/storybook/page.tsx",
    "app/trust/page.tsx",
    "app/feed/page.tsx",
    "app/matches/page.tsx",
    "app/ai-studio/page.tsx",
    "app/chains/page.tsx",
    "app/plus/page.tsx",
    "app/scale/page.tsx",
    "app/items/new/page.tsx",
    "app/my-items/page.tsx",
    "app/offers/page.tsx",
    "app/trades/page.tsx",
    "app/chat/page.tsx",
    "app/admin/page.tsx",
    "components/layout/AppShell.tsx",
    "components/matching/MatchesForYouRail.tsx",
    "components/ai/AiListingAssistPanel.tsx",
    "components/chain/ThreeWayCycleStudio.tsx",
    "components/chain/CycleSvgGraph.tsx",
    "components/listing/FeaturedListingsGrid.tsx",
  ];

  for (const rel of requiredFiles) {
    const fullPath = path.join(__dirname, rel);
    assert.ok(fs.existsSync(fullPath), `Expected web source file to exist: ${rel}`);
  }
});
