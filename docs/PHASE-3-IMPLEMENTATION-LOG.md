# Xchange — Phase 3 (`v0.3 "AI Assist"`) Implementation & Line-by-Line Change Log

This document records every file created or modified during **Phase 3 — AI Assist (`v0.3`)**, covering Backend tasks `BE-3.1` through `BE-3.5` and Web tasks `WEB-3.1` through `WEB-3.4`.

---

## 1. Shared AI Contracts, Prompt-Injection Sanitizer & Vector Similarity (`packages/shared`, `packages/api-sdk`)
| File Path | Lines | Detailed Description of Code & Changes |
| :--- | :--- | :--- |
| `packages/shared/src/phase3.ts` | `1–119` | Implemented `sanitizeUntrustedListingPrompt()` (System Design Section 12 prompt-injection hygiene), `computeSemanticVector()`, `computeCosineSimilarity()` (`BE-3.4` `pgvector` similarity), Zod schemas (`AiIdentifyInputSchema`, `AiValuateInputSchema`, `AiValuationFeedbackSchema`), and DTOs (`AiIdentificationResult`, `AiSemanticSearchResult`, `AiTelemetryDto`). |
| `packages/shared/src/index.ts` | `6` | Added `export * from "./phase3";`. |
| `packages/shared/src/shared.test.mjs` | `52–54` | Added unit test assertions for `sanitizeUntrustedListingPrompt` and `"Estimated range, not a market price"`. |
| `packages/api-sdk/src/index.ts` | `10–15, 516–555` | Added typed SDK methods: `aiIdentifyItem()`, `aiEstimateValue()`, `aiRecordValuationFeedback()`, `aiSemanticSearch()`, and `getAiTelemetry()`. |

---

## 2. Backend AI Module (`apps/api` — `BE-3.1` to `BE-3.5`)
| File Path | Lines | Detailed Description of Code & Changes |
| :--- | :--- | :--- |
| `apps/api/src/modules/marketplace/ai.service.ts` | `1–222` | Implemented `AiAssistService` with image-hash caching (`imageHashCache`), daily quota cost caps (`remainingDailyQuota`), `identify()` (`POST /v1/ai/identify`), `estimateValue()` (`POST /v1/ai/value` with explicit `"Estimated range, not a market price"` label), `recordValuationFeedback()` (`POST /v1/ai/value-feedback` thumbs up/down), `semanticSearch()` (`POST /v1/ai/semantic-search` with `"Why this match"` chips), and `getTelemetry()` (`GET /v1/ai/telemetry` tracking Phase 3 exit gate: `>= 60%` AI-assisted listings and `< 90s` median listing time). |
| `apps/api/src/modules/marketplace/marketplace.router.ts` | `12, 23, 272–296` | Mounted `/v1/ai/identify`, `/v1/ai/value`, `/v1/ai/value-feedback`, `/v1/ai/semantic-search`, and `/v1/ai/telemetry`. |
| `apps/api/src/api.test.ts` | `247–296` | Added Phase 3 E2E test verifying prompt-injection sanitization, `"Estimated range, not a market price"` label, image-hash cache hit on repeat call, `pgvector` semantic search, and Phase 3 Exit Gate (`aiAssistedListingsSharePercent >= 60%` & `medianListingTimeSeconds < 90s`). |

---

## 3. Next.js 15 Web Application (`apps/web` — `WEB-3.1` to `WEB-3.4`)
| File Path | Lines | Detailed Description of Code & Changes |
| :--- | :--- | :--- |
| `apps/web/src/components/layout/AppShell.tsx` | `14` | Added `{ href: "/ai-studio", label: "AI Vision & Vector", badge: "v0.3" }` to navigation rail and mobile dock. |
| `apps/web/src/components/ai/AiListingAssistPanel.tsx` | `1–175` | Created `<AiListingAssistPanel />` (`WEB-3.1`, `WEB-3.2`, `WEB-3.4`) with photo preset selector, loading skeleton, manual fallback state tester, `"Estimated range, not a market price"` confidence badge, 1-click form auto-fill, and `👍 Accurate` / `👎 Off-mark` valuation feedback thumbs. |
| `apps/web/src/app/items/new/page.tsx` | `9, 83–96` | Embedded `<AiListingAssistPanel />` inside the Create Listing screen. |
| `apps/web/src/app/ai-studio/page.tsx` | `1–145` | Created `/ai-studio` showcasing Phase 3 Exit Gate telemetry, interactive `pgvector` semantic cosine similarity search with `"Why this match"` chips (`WEB-3.3`), and live Prompt-Injection Hygiene guard tester. |
| `apps/web/src/web.test.mjs` | `19, 28` | Added `app/ai-studio/page.tsx` and `components/ai/AiListingAssistPanel.tsx` to route verification tests. |
