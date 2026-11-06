# Changelog

All notable changes to the **Xchange** monorepo are documented in this file.

## [0.3.0] — Phase 3: AI Assist (`v0.3`) — 2026-11-06

### Added
- **Gemini AI Vision Identification & Valuation Range Engine (`BE-3.1`, `BE-3.2`, `BE-3.3`, `WEB-3.1`, `WEB-3.2`, `WEB-3.4`):**
  - Implemented `AiAssistService` with image-hash caching, daily quota cost caps, prompt-injection sanitization (`sanitizeUntrustedListingPrompt`), `POST /v1/ai/identify`, `POST /v1/ai/value` (explicitly labelled `"Estimated range, not a market price"` with confidence band), `POST /v1/ai/value-feedback` (`👍` / `👎`), and `<AiListingAssistPanel />` in `/items/new` with loading/fallback states.
- **`pgvector` Semantic Search & Match Explanations (`BE-3.4`, `BE-3.5`, `WEB-3.3`):**
  - Implemented `computeSemanticVector()`, `computeCosineSimilarity()`, `POST /v1/ai/semantic-search` with `"Why this match"` chips, and the `/ai-studio` interactive playground + Phase 3 Exit Gate telemetry ($\ge 60\%$ AI-assisted listings, $< 90\text{s}$ listing time).

## [0.2.0] — Phase 2: Smart Matching Lite (`v0.2`) — 2026-11-06

### Added
- **5-Factor Smart Matching Engine (`BE-2.1`, `BE-2.2`, `WEB-2.1`, `WEB-2.2`):**
  - Implemented $M = 0.30I + 0.25V + 0.20L + 0.15C + 0.10P$ scoring in `@xchange/shared` (`evaluatePairFactors`) and `MatchingService` (`apps/api`), automatic 2-way mutual match detection (`isMutualMatch`) with score boost, `<MatchesForYouRail />` on `/feed`, and the `/matches` studio.
- **Saved Searches & Real-Time Alerts (`BE-2.3`, `WEB-2.3`):**
  - `GET/POST /v1/saved-searches`, `POST /v1/saved-searches/:id/toggle-alert`, `DELETE /v1/saved-searches/:id`, and interactive Saved Search manager UI.
- **Match Feedback & Phase 2 Exit Gate Telemetry (`BE-2.4`, `WEB-2.4`):**
  - `POST /v1/matches/:id/feedback` (`shown`, `clicked`, `dismissed`, `offered`), 1-click recommendation offers (`POST /v1/matches/:id/offer` with `origin: "match"`), and live Phase 2 Exit Gate telemetry verifying $\ge 30\%$ of offers originate from recommendations.

## [0.1.0] — Phase 1: Core Marketplace (`v0.1 "Concierge Beta"`) — 2026-11-06

### Added
- **Listings, Media & Wants (`BE-1.3`, `BE-1.4`, `WEB-1.3`, `WEB-1.4`, `WEB-1.5`):**
  - Signed R2 upload URL endpoint (`POST /v1/media/upload-url`), Listing CRUD (`POST/GET /v1/items`, `GET /v1/me/items`, `POST /v1/items/:id/publish|pause|delete`), prohibited-item screening (`422 PROHIBITED_ITEM`), and `/items/new` + `/my-items` screens.
- **Discovery, Search & Wishlist (`BE-1.5`, `WEB-1.6`):**
  - `GET /v1/feed` & `GET /v1/search` with `for_you` (match score), `nearby` (PostGIS distance), and `new` sorting, category/condition/radius filters, wishlist save toggle (`POST /v1/saved-items/:id`), and `/feed` screen.
- **Offers, Counteroffers & Atomic Item Locking (`BE-1.6`, `WEB-1.8`):**
  - `GET/POST /v1/offers`, versioned counteroffers (`POST /v1/offers/:id/counter`), reject/withdraw, and `POST /v1/offers/:id/accept` (atomically locks items, cancels competing pending offers, and creates a `scheduling` trade) + `/offers` screen.
- **Trade State Machine, Safe Meetup Points & 6-Digit Handover Codes (`BE-1.7`, `WEB-1.10`):**
  - Curated Bengaluru Safe Meetup Points, `POST /v1/trades/:id/schedule`, two-party 6-digit handover code confirmation (`POST /v1/trades/:id/confirm`), cancel/dispute flows, append-only `trade_events` audit log, and `/trades` studio.
- **Real-Time Chat with Pre-Accept Phone/URL Masking (`BE-1.8`, `BE-1.9`, `WEB-1.9`, `WEB-1.12`):**
  - `GET /v1/conversations`, `GET/POST /v1/conversations/:id/messages` enforcing `FR-CHT-2` phone/link masking until trade acceptance, notifications center (`GET/POST /v1/notifications`), and `/chat` screen.
- **Double-Blind Reviews, Moderation & Admin Console (`BE-1.10`–`BE-1.13`, `WEB-1.11`, `WEB-1.13`, `WEB-1.14`):**
  - `POST /v1/trades/:id/reviews` double-blind reveal, `POST /v1/reports`, `GET /v1/admin/dashboard`, `POST /v1/admin/reports/:id/resolve`, `Idempotency-Key` support, and `/admin` console.

## [0.0.1] — Phase 0: Foundations (`v0.0`) — 2026-11-06

### Added
- **Python Virtual Environment & Doc Pipeline (`.venv`, `scripts/convert_docs.py`):**
  - Created `.venv` (`Python 3.14.4`) and converted the 4 `.docx` specification documents into `docs/01-prd.md`, `docs/02-brd.md`, `docs/03-system-design.md`, and `docs/04-web-spec.md`.
- **Monorepo & CI Foundations (`P0-T1`, `P0-T2`, `BE-0.1`, `BE-0.4`):**
  - Configured root `package.json`, `pnpm-workspace.yaml`, `.nvmrc` (Node 22 LTS), `.gitignore`, `.clinerules`, `.env.example`, and `.github/workflows/ci.yml`.
- **Shared Packages (`P0-T3`, `WEB-0.1`, `WEB-0.3`):**
  - `@xchange/tsconfig`: `base.json`, `nextjs.json`, `node.json`.
  - `@xchange/eslint-config`: Shared lint rules (`index.js`).
  - `@xchange/ui-tokens`: Design system tokens (`breakpoints`, `spacing`, `radius`, `elevation`, `motion`, `colors`, `typeScale`) and `tokens.css` (dark & light theme custom properties).
  - `@xchange/shared`: Domain enums (`enums.ts`), 21 PRD Section 10 analytics events, prohibited-item keyword/category check (`checkProhibitedContent`), 1 km privacy grid rounding (`snapToOneKmGrid`), match score engine ($M = 0.30I + 0.25V + 0.20L + 0.15C + 0.10P$), and Zod schemas (`schemas.ts`).
  - `@xchange/api-sdk`: Typed client (`XchangeApiClient`) with RFC 9457 `ApiProblemError` handling.
- **Database Schema v1, Docker & Seed Data (`P0-T4`, `BE-0.3`, `BE-0.5`):**
  - `infra/docker-compose.yml` & `infra/init-db.sql`: PostgreSQL 16 (`pgvector`, `pg_trgm`, `pgcrypto`, `postgis`), Redis 7, MinIO, MailHog.
  - `apps/api/prisma/schema.prisma` & `migrations/0001_phase0_v1/migration.sql`: Complete v1 database schema separating `Offer`, `Trade`, `TradeParticipant`, `ChainProposal`, `TradeEvent`, and `OutboxEvent`.
  - `apps/api/prisma/seed-data.ts` & `seed.ts`: Bengaluru cluster seed data (`HSR Layout`, `Koramangala`, `Indiranagar`, `Whitefield`), categories, featured listings, and 3-way chain cycle (`A → B → C → A`).
- **Backend Modular Monolith (`P0-T5`, `BE-0.2`, `BE-0.4`):**
  - `apps/api`: Redacted JSON logger (`env.config.ts`), RFC 9457 `problem+json` helper, `HealthService` (`GET /health`, `GET /v1/config`), `CatalogService` (`GET /v1/cities`, `GET /v1/categories`, `GET /v1/showcase`), `AuthService` (`POST /v1/auth/otp/request`, `POST /v1/auth/otp/verify`, `GET /v1/me` JWT guard), and OpenAPI 3.1 generator (`apps/api/openapi.json`).
- **Next.js Web Application (`WEB-0.1` to `WEB-0.5`) & Legal Policies (`P0-T6`):**
  - `apps/web`: App Shell (`AppShell.tsx`), Security & CSP Middleware (`middleware.ts`), interactive **3-Way Cycle Studio** (`ThreeWayCycleStudio.tsx` & `CycleSvgGraph.tsx`), **Featured Listings Grid** (`FeaturedListingsGrid.tsx`), **Phone OTP Sign-In & Protected `/v1/me` Gate** (`/login`), **Storybook Visual State Matrix** (`/storybook`), and **DPDP Privacy & Prohibited-Item Scanner** (`/trust` + `docs/legal/*.md`).
