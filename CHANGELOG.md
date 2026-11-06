# Changelog

All notable changes to the **Xchange** monorepo are documented in this file.

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
