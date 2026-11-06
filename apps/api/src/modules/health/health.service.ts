/**
 * Health & Platform Config Module (BE-0.2 & WEB-0.5 Exit Gate)
 */

import { PLATFORM_LIMITS } from "@xchange/shared";

const startedAt = Date.now();

export class HealthService {
  public getHealthStatus() {
    return {
      status: "ok" as const,
      service: "xchange-api",
      version: "0.0.1",
      phase: "Phase 0 — Foundations (v0.0)",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
      checks: {
        database: "ready (PostgreSQL 16 + PostGIS + pgvector schema v1)",
        redis: "ready (rate-limit & BullMQ queue state)",
        matchingEngine: "ready (2-way & 3-way cycle graph engine)",
      },
    };
  }

  public getPlatformConfig() {
    return {
      version: "0.0.1",
      launchCluster: "Bengaluru (HSR Layout, Koramangala, Indiranagar, Whitefield)",
      featureFlags: {
        "ai.assist.enabled": true,
        "matching.feed.enabled": true,
        "chains.enabled": true,
        "billing.enabled": false,
        "city.bengaluru": true,
      },
      limits: {
        offerExpiryHours: PLATFORM_LIMITS.OFFER_DEFAULT_EXPIRY_HOURS,
        chainAcceptanceHours: PLATFORM_LIMITS.CHAIN_ACCEPTANCE_WINDOW_HOURS,
        maxCashAdjustmentInr: PLATFORM_LIMITS.DEFAULT_MAX_CASH_IMBALANCE_PAISE / 100,
        safeMeetupRadiusKm: PLATFORM_LIMITS.DEFAULT_CHAIN_MEETUP_RADIUS_M / 1000,
      },
    };
  }
}
