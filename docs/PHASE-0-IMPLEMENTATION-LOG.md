# Xchange — Phase 0 Exhaustive Implementation & Line-by-Line Change Log

This document records every single file, script, configuration, module, component, database table, and line edit created during **Phase 0 — Foundations (`v0.0`)**.

---

## 1. Python Virtual Environment & Specification Conversion
| File Path | Lines | Detailed Description of Code & Changes |
| :--- | :--- | :--- |
| `.venv/` | N/A | Created Python 3.14.4 virtual environment (`python3 -m venv --without-pip .venv`) per requirement before running any Python script. |
| `scripts/convert_docs.py` | `1–95` | Python script executed via `./.venv/bin/python` that parses `word/document.xml` inside each of the 4 `.docx` files and writes clean Markdown files into `docs/`. |
| `docs/01-prd.md` | `1–291` | Generated Markdown version of *Xchange — Product Requirements Document (PRD).docx*. |
| `docs/02-brd.md` | `1–246` | Generated Markdown version of *Xchange — Business Requirements Document (BRD).docx*. |
| `docs/03-system-design.md` | `1–296` | Generated Markdown version of *Xchange — System Design & Architecture.docx*. |
| `docs/04-web-spec.md` | `1–189` | Generated Markdown version of *Xchange — Web Application Build Spec (Next.js).docx*. |

---

## 2. Root Monorepo, Legal Policies & Infrastructure (`P0-T1`, `P0-T2`, `P0-T6`, `BE-0.1`, `BE-0.3`)
| File Path | Lines | Detailed Description of Code & Changes |
| :--- | :--- | :--- |
| `.gitignore` | `1–35` | Ignores `node_modules/`, `.venv/`, `.next/`, `dist/`, `.env`, while preserving `.env.example`. |
| `.nvmrc` | `1` | Pins Node.js major version `22` (Node 22 LTS). |
| `.clinerules` | `1–13` | Encodes all 10 engineering guardrails from System Design Section 18. |
| `pnpm-workspace.yaml` | `1–3` | Declares `apps/*` and `packages/*` workspace globs. |
| `package.json` | `1–27` | Root monorepo manifest defining `build`, `dev:api`, `dev:web`, `lint`, `typecheck`, `test`, `openapi:generate`, `db:seed`, and `docs:convert` scripts. |
| `.env.example` | `1–46` | Template for API, PostgreSQL, Redis, JWT/OTP TTLs, MinIO/R2, Gemini, Maps, PostHog, and Sentry variables. |
| `infra/docker-compose.yml` | `1–56` | Defines `postgres` (`pgvector/pgvector:pg16`), `redis` (`redis:7-alpine`), `minio`, and `mailhog` containers with healthchecks. |
| `infra/init-db.sql` | `1–13` | Bootstraps `uuid-ossp`, `pgcrypto`, `pg_trgm`, `vector`, and `postgis` extensions. |
| `.github/workflows/ci.yml` | `1–39` | GitHub Actions pipeline executing `lint`, `typecheck`, `test`, `openapi:generate`, and `build` on Node 22. |
| `docs/legal/privacy-policy.md` | `1–24` | DPDP Act 2023 compliant Privacy Policy draft (`P0-T6`). |
| `docs/legal/terms-of-service.md` | `1–26` | Terms of Service draft (`P0-T6`). |
| `docs/legal/prohibited-items-policy.md` | `1–25` | Prohibited & Restricted Items Policy (`P0-T6`, `FR-LST-4`). |

---

## 3. Shared Workspace Packages (`packages/*`)
| File Path | Lines | Detailed Description of Code & Changes |
| :--- | :--- | :--- |
| `packages/tsconfig/*` | `1–21` | `base.json`, `nextjs.json`, `node.json`, and `package.json`. |
| `packages/eslint-config/*` | `1–12` | Shared ESLint configuration (`index.js` & `package.json`). |
| `packages/ui-tokens/src/index.ts` | `1–126` | Defines `breakpoints` (`360, 640, 768, 1024, 1280, 1440`), `spacing`, `radius`, `elevation`, `motion`, `colors`, and `typeScale`. |
| `packages/ui-tokens/src/tokens.css` | `1–40` | CSS custom properties for `[data-theme="dark"]` and `[data-theme="light"]`. |
| `packages/ui-tokens/src/tokens.test.mjs` | `1–16` | Unit test verifying required breakpoints and motion curves. |
| `packages/shared/src/enums.ts` | `1–113` | Domain enums and all 21 PRD Section 10 `ANALYTICS_EVENTS`. |
| `packages/shared/src/utilities.ts` | `1–115` | `PLATFORM_LIMITS`, `PROHIBITED_KEYWORDS`, `checkProhibitedContent()`, `snapToOneKmGrid()`, `formatInrFromPaise()`, and `computeMatchScore()`. |
| `packages/shared/src/schemas.ts` | `1–88` | Zod schemas (`OtpRequestSchema`, `OtpVerifySchema`, `CreateOfferSchema`) and DTO interfaces. |
| `packages/shared/src/shared.test.mjs` | `1–47` | Unit tests verifying all 21 analytics events, matching score weights, and prohibited content scanner. Note: Lines 10 & 40 updated from `index.ts` to `enums.ts` and `utilities.ts` after modularizing `packages/shared/src/`. |
| `packages/api-sdk/src/index.ts` | `1–204` | Typed `XchangeApiClient` with RFC 9457 `ApiProblemError`. |
| `packages/api-sdk/src/sdk.test.mjs` | `1–19` | Unit test verifying SDK methods and `ApiProblemError`. |

---

## 4. Backend Modular Monolith (`apps/api` — `BE-0.1` to `BE-0.5`, `P0-T4`, `P0-T5`)
| File Path | Lines | Detailed Description of Code & Changes |
| :--- | :--- | :--- |
| `apps/api/prisma/schema.prisma` | `1–331` | Complete Prisma schema v1 (`City`, `Category`, `User`, `UserIdentity`, `UserSession`, `Item`, `ItemImage`, `WantedPreference`, `Offer`, `Trade`, `ChainProposal`, `OutboxEvent`). |
| `apps/api/prisma/migrations/0001_phase0_v1/migration.sql` | `1–133` | Raw SQL migration creating `offer_threads`, `offers` (`idx_offers_one_pending_per_thread`), `offer_items`, `chain_proposals`, `chain_proposal_edges`, `chain_acceptances`, `trades`, `trade_participants`, `trade_handoffs`, `trade_events`, and `outbox_events`. |
| `apps/api/prisma/seed-data.ts` | `1–169` | Seed data for Bengaluru launch cluster, 6 categories, featured items, and 3-way chain cycle (`A → B → C → A`). |
| `apps/api/prisma/seed.ts` | `1–29` | Seed verification runner (`npm run db:seed`). |
| `apps/api/src/config/env.config.ts` | `1–88` | Typed config loader and structured JSON logger with automatic PII redaction (`phoneE164`, `email`, `otpCode`, `accessToken`, `refreshToken`). |
| `apps/api/src/common/problem-details.ts` | `1–33` | RFC 9457 `application/problem+json` response serializer. |
| `apps/api/src/modules/health/health.service.ts` | `1–43` | `/health` and `/v1/config` service returning feature flags and platform limits. |
| `apps/api/src/modules/catalog/catalog.service.ts` | `1–36` | `/v1/cities`, `/v1/categories`, and `/v1/showcase` service. Line 10 edited from `../../prisma/seed-data` to `../../../prisma/seed-data` to match relative path depth. |
| `apps/api/src/modules/auth/jwt.util.ts` | `1–36` | HMAC-SHA256 JWT signer (`signHmacJwt`) and verifier (`verifyHmacJwt`). |
| `apps/api/src/modules/auth/auth.service.ts` | `1–206` | Phone OTP request/verify service enforcing 5-min TTL, max 5 attempts/hr, 30s resend cooldown, and protected `getAuthenticatedUser()` (`/v1/me`). |
| `apps/api/src/openapi/generate-openapi.ts` | `1–125` | Generates `apps/api/openapi.json` (OpenAPI 3.1 contract). |
| `apps/api/src/app.ts` | `1–132` | HTTP application router with CORS, security headers, and RFC 9457 exception handling. |
| `apps/api/src/main.ts` | `1–11` | Server entrypoint listening on `API_PORT` (default `4000`). |
| `apps/api/src/api.test.ts` | `1–95` | In-process integration test (`tsx --test src/api.test.ts`, replacing initial `api.test.mjs`) verifying `/health`, `/v1/config`, `/v1/showcase`, unauthenticated `401` on `/v1/me`, and full Phone OTP sign-in -> authenticated `/v1/me`. |

---

## 5. Next.js Web Application & Mobile Skeleton (`apps/web`, `apps/mobile` — `WEB-0.1` to `WEB-0.5`)
| File Path | Lines | Detailed Description of Code & Changes |
| :--- | :--- | :--- |
| `apps/web/src/middleware.ts` | `1–40` | Next.js middleware injecting strict `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and route trace header. |
| `apps/web/src/styles/globals.css` | `1–84` | Imports `@xchange/ui-tokens/tokens.css`, defines `.xc-mesh-backdrop`, `.xc-glass-panel`, `.xc-card-lift`, `.xc-svg-flow`, and `prefers-reduced-motion` accessibility rules. |
| `apps/web/src/lib/fallback-data.ts` | `1–156` | Seeded fallback data for SSR/offline resilience. |
| `apps/web/src/lib/api-client.ts` | `1–19` | Instantiates `apiClient` from `@xchange/api-sdk` with in-memory JWT access token injection. |
| `apps/web/src/lib/observability.ts` | `1–37` | Typed PostHog analytics event dispatcher (`emitAnalyticsEvent`) and Sentry exception hook. |
| `apps/web/src/components/providers/AppProviders.tsx` | `1–117` | Theme context (`dark`/`light`), cluster state, auth session state, and WCAG 2.1 AA ARIA-live toast notification viewport. |
| `apps/web/src/components/layout/AppShell.tsx` | `1–150` | Responsive App Shell with sticky glassmorphic header, live `/health` status indicator, Bengaluru cluster switcher, theme toggle, desktop nav rail, and mobile bottom dock. |
| `apps/web/src/components/chain/CycleSvgGraph.tsx` | `1–101` | Accessible animated SVG triangle (`A → B → C → A`) with flowing dash animation and interactive node selection. |
| `apps/web/src/components/chain/ThreeWayCycleStudio.tsx` | `1–145` | Interactive 3-Way Cycle Studio with live match score calculation, unanimous consent lock toggles, peer cash balancer slider, and safe meetup point display. |
| `apps/web/src/components/listing/FeaturedListingsGrid.tsx` | `1–138` | Bengaluru Featured Listings Grid with category filter pills, value confidence bands, wants chips, and swap offer action. |
| `apps/web/src/app/layout.tsx` | `1–21` | Root Next.js layout wrapping `<AppProviders>` and `<AppShell>`. |
| `apps/web/src/app/page.tsx` | `1–95` | Landing page (`/`) combining the Hero banner, key metrics strip, `ThreeWayCycleStudio`, and `FeaturedListingsGrid`. |
| `apps/web/src/app/login/page.tsx` | `1–145` | Interactive Phone OTP sign-in & protected `GET /v1/me` verification page (`/login`) fulfilling the Phase 0 Exit Gate. |
| `apps/web/src/app/storybook/page.tsx` | `1–116` | Interactive Design System & Storybook Visual State Matrix (`/storybook`) testing `default`, `loading`, `empty`, and `error` states. |
| `apps/web/src/app/trust/page.tsx` | `1–113` | Interactive Trust & Legal page (`/trust`) featuring a live Prohibited-Item Scanner (`FR-LST-4`) and live 1 km Location Grid Snapper (`FR-PRO-4`). |
| `apps/web/src/web.test.mjs` | `1–26` | Automated test verifying all Web Phase 0 routes, middleware, and components. |
| `apps/mobile/src/index.ts` & `mobile.test.mjs` | `1–16` | Cross-platform mobile client skeleton & test wired to `@xchange/api-sdk` and `@xchange/ui-tokens`. |

