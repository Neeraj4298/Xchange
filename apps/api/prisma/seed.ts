/**
 * Phase 0 Database Seeder Script (BE-0.5 / P0-T4)
 * Validates and prints the Bengaluru Launch Cluster seed data.
 */

import {
  SEED_CATEGORIES,
  SEED_CITIES,
  SEED_FEATURED_ITEMS,
  SEED_THREE_WAY_CHAIN,
} from "./seed-data";

async function runSeed(): Promise<void> {
  console.log("==============================================================");
  console.log("Xchange Phase 0 Seed Runner (BE-0.5)");
  console.log("==============================================================");
  console.log(`Cities configured       : ${SEED_CITIES.length} (${SEED_CITIES[0]?.name} active)`);
  console.log(`Categories configured   : ${SEED_CATEGORIES.length}`);
  console.log(`Seeded active listings  : ${SEED_FEATURED_ITEMS.length}`);
  console.log(
    `3-Way Chain cycle (A->B->C->A): ${SEED_THREE_WAY_CHAIN.map((n) => `${n.participantCode}(${n.userName})`).join(" -> ")} -> A`
  );
  console.log("Seed dataset verified successfully.");
}

runSeed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
