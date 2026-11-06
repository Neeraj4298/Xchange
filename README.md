# Xchange — Peer-to-Peer Circular Exchange Marketplace (Monorepo)

> **Tagline:** Own less. Exchange more.  
> **Phase Status:** Phase 0 — Foundations (`v0.0`) Completed & Verified  
> **Launch Market:** Bengaluru, India (`HSR Layout`, `Koramangala`, `Indiranagar`, `Whitefield`)

Xchange is a peer-to-peer exchange marketplace where individuals trade items they own for items they want, with optional peer-to-peer cash adjustment. Its core differentiator is a graph-based matching engine that discovers **2-way mutual swaps** and **3-way exchange cycles (`A → B → C → A`)**.

---

## 1. Repository Architecture (`P0-T1` / `BE-0.1`)

```text
Xchange/
├── .clinerules                       # Agent engineering rules (System Design Section 18)
├── .env.example                      # Environment variable template
├── .github/workflows/ci.yml          # GitHub Actions CI pipeline (P0-T2 / BE-0.4)
├── .venv/                            # Local Python 3.14 virtual environment
├── scripts/convert_docs.py           # Python script converting source .docx specs to docs/*.md
├── docs/
│   ├── 01-prd.md                     # Product Requirements Document
│   ├── 02-brd.md                     # Business Requirements Document
│   ├── 03-system-design.md           # System Design & Architecture
│   ├── 04-web-spec.md                # Next.js Web Application Build Spec
│   ├── PHASE-0-IMPLEMENTATION-LOG.md # File-by-file & line-by-line change log
│   └── legal/                        # Phase 0 Legal drafts (P0-T6: Privacy, Terms, Prohibited Items)
├── infra/
│   ├── docker-compose.yml            # PostgreSQL 16 + PostGIS + pgvector, Redis 7, MinIO, MailHog
│   └── init-db.sql                   # PostgreSQL extension bootstrap SQL
├── packages/
│   ├── tsconfig/                     # Shared strict TypeScript configs (base, nextjs, node)
│   ├── eslint-config/                # Shared lint rules
│   ├── ui-tokens/                    # "Kinetic Circular Craft" design tokens & CSS variables
│   ├── shared/                       # Domain enums, Zod schemas, matching score formula, privacy grid
│   └── api-sdk/                      # Contract-first typed OpenAPI client with RFC 9457 Problem Details
└── apps/
    ├── api/                          # Modular Monolith Backend + Prisma schema v1 + OpenAPI generator
    ├── web/                          # Next.js 15 App Router UI + 3-Way Cycle Studio + Storybook catalog
    └── mobile/                       # Mobile cross-platform SDK & token consumer skeleton
```

---

## 2. Quick Start & Single-Command Docker Compose

### Option A: One-Command Full Stack with Docker Compose (`postgres`, `redis`, `minio`, `mailhog`, `api`, `web`)
```bash
# Launch all 6 containers (PostgreSQL 16 + pgvector, Redis 7, MinIO, MailHog, API :4000, Web :3000)
docker compose up --build -d

# Check container status & logs
docker compose ps
docker compose logs -f api web

# Stop all containers
docker compose down
```

### Option B: Local Node.js Development
```bash
# 1. Convert .docx specs to Markdown using the local Python .venv
npm run docs:convert

# 2. Generate OpenAPI 3.1 contract (apps/api/openapi.json)
npm run openapi:generate

# 3. Verify & print Bengaluru Launch Cluster seed data (BE-0.5)
npm run db:seed

# 4. Run Lint, Strict Typecheck, Automated Tests & Production Builds
npm run lint
npm run typecheck
npm run test
npm run build

# 5. Start API (http://localhost:4000) and Web App (http://localhost:3000)
npm run dev:api
npm run dev:web
```
