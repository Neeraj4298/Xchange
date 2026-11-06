# Xchange — System Design & Architecture

Version: 1.0 | Doc 3 of 6 | Audience: engineers and AI coding agents (Cursor, Cline, Antigravity) | Depends on: 01 PRD

This is the source of truth for backend, data model, APIs and infrastructure. Platform docs (04 Web, 05 iOS, 06 Android) reference it. When an agent asks "what should I build", point it at the phase and task IDs in section 17.

## 1. Architectural principles

Modular monolith first. One NestJS deployable, one Postgres database, strict module boundaries. No microservices until a module has an independent scaling or team need.

Offer, Trade and Participant are separate from day one so 3-way chains need no schema redesign.

Consent before lock. Items are locked only after every participant explicitly accepts.

Everything important is an event. State transitions write an append-only audit log and publish a domain event.

No money custody. Cash adjustment is a recorded agreement, not a payment.

Estimates are ranges. AI values always carry a confidence band and a source.

Contract-first. OpenAPI is generated from the backend; web and mobile clients use generated typed SDKs.

Feature flags per city and per version (e.g. chains.enabled, ai.assist.enabled).

## 2. System context and container view

+-----------------+   +-------------------+   +------------------+   | Next.js Web     |   | React Native iOS  |   | React Native     |   | (SSR + PWA)     |   | (Expo)            |   | Android (Expo)   |   +--------+--------+   +---------+---------+   +---------+--------+            |                      |                       |            +----------- HTTPS / WSS (JWT) ---------------+                                   |                        +----------v-----------+                        |  Cloudflare (CDN,    |                        |  WAF, rate limit)    |                        +----------+-----------+                                   |                    +--------------v---------------+                    |   API Gateway / Load Bal.    |                    +--------------+---------------+                                   |        +--------------------------v---------------------------+        |             NestJS Modular Monolith                   |        |  Auth | Users | Listings | Discovery | Offers | Trades |        |  Chat | Notifications | Reviews | Moderation | Admin  |        |  Matching | Media | AI | Billing(v1) | Analytics        |        +---+----------+----------+-----------+----------+------+            |          |          |           |          |     +------v--+  +----v---+  +---v----+  +---v-----+  +-v----------+     |Postgres |  | Redis  |  |  R2    |  | Gemini  |  | FCM / APNs |     |+PostGIS |  |cache,  |  | images |  |  API    |  | email, SMS |     |+pgvector|  |queues, |  |        |  |         |  |            |     |         |  |pubsub  |  |        |  |         |  |            |     +---------+  +---+----+  +--------+  +---------+  +------------+                      |               +------v-------+               | Worker procs |  (same codebase, BullMQ consumers)               | matching,    |               | notifications|               | expiry, AI   |               +--------------+

## 3. Technology decisions

| Layer | Choice | Notes |
| --- | --- | --- |
| Web | Next.js (App Router), TypeScript, Tailwind, shadcn/ui | SSR for listing SEO |
| Mobile | React Native + Expo (dev client), Expo Router | One codebase for iOS and Android |
| Backend | Node.js 22 LTS, NestJS, TypeScript | Fastify adapter |
| DB | PostgreSQL 16 + PostGIS + pgvector + pg_trgm | Geo, embeddings, fuzzy search |
| ORM | Prisma; raw SQL for geo and graph queries |  |
| Cache and queue | Redis, BullMQ | Jobs, rate limits, presence |
| Realtime | Socket.IO (WebSocket) with Redis adapter | Chat, offer and trade events |
| Media | Cloudflare R2 + signed uploads + image resizing |  |
| Auth | Own JWT service on phone OTP, Google, Apple; optional Supabase or Firebase Auth as OTP provider | Keep abstraction |
| AI | Gemini API behind an AiProvider interface | Swappable |
| Maps | Google Maps Places / Mapbox | Abstraction GeoProvider |
| Push | FCM (Android, iOS via APNs) |  |
| SMS OTP | MSG91 / Twilio / Gupshup with DLT |  |
| Search | Postgres FTS + trigram at v0.1; move to Meilisearch or Typesense when feed latency degrades |  |
| Observability | OpenTelemetry, Sentry, Grafana / Prometheus or a managed equivalent |  |
| Analytics | PostHog | Event set from PRD section 10 |
| Infra | Docker; deploy on Railway / Render / Fly.io initially, AWS (ap-south-1) at v1.0 |  |
| IaC and CI | Terraform (from v1.0), GitHub Actions |  |

## 4. Repository layout (monorepo)

xchange/  apps/    api/               # NestJS (modules below)    web/               # Next.js    mobile/            # Expo React Native (iOS + Android)    admin/             # Next.js admin (can start inside web under /admin)  packages/    shared/            # zod schemas, enums, constants, utils    api-sdk/           # generated OpenAPI TypeScript client    ui-tokens/         # design tokens (colors, spacing, type)    eslint-config/ tsconfig/  infra/               # docker-compose, terraform  docs/                # these six documents as markdown  .cursor/rules/ or .clinerules  # agent rules (section 18)

## 5. Backend module map

| Module | Responsibility | Depends on |
| --- | --- | --- |
| auth | OTP, OAuth, JWT, refresh, device sessions | users |
| users | Profile, verification, blocks, settings, deletion | media |
| catalog | Categories, item types, attributes | none |
| listings | Item CRUD, wants, status, locking | catalog, media, users |
| discovery | Feed, search, filters, saved searches | listings, matching |
| offers | Offer lifecycle, versions, expiry | listings, users |
| trades | Trade, participants, handoffs, state machine, codes | offers, listings |
| chat | Conversations, messages, presence | offers, users |
| notifications | In-app, push, email, preferences | users |
| reviews | Ratings, reputation aggregation | trades |
| moderation | Reports, takedowns, bans, content scanning | all |
| matching | Scoring, candidate generation, 2-way and 3-way cycles | listings, offers |
| chains | Chain proposals, unanimous acceptance, chain trades | matching, trades |
| media | Signed uploads, processing, moderation | none |
| ai | Identification, description, valuation, embeddings | media |
| billing (v1.0) | Plans, store receipts, promotions | users |
| analytics | Event emission | all |
| admin | Back-office endpoints | all |

Each module exposes a service interface; cross-module access goes through the service or domain events, never through another module's tables directly.

## 6. Data model (PostgreSQL)

IDs are UUIDv7. All tables have created_at, updated_at; soft delete where noted via deleted_at. Money is stored as integer paise with currency default INR.

### 6.1 Core tables

-- usersusers(id, phone_e164 UNIQUE, email NULL UNIQUE, name, avatar_url, bio,      home_cell GEOGRAPHY(Point) /* rounded ~1km */, city_id,      status ENUM('active','suspended','banned','deleted'),      rating_avg NUMERIC(3,2), rating_count INT, trades_completed INT,      verification_level ENUM('phone','id'), locale, last_seen_at, deleted_at)user_identities(id, user_id, provider ENUM('phone','google','apple'), provider_uid, UNIQUE(provider, provider_uid))user_sessions(id, user_id, refresh_hash, device_id, platform, push_token, expires_at, revoked_at)user_verifications(id, user_id, type ENUM('phone','id'), status, evidence_ref, reviewed_by, reviewed_at)user_blocks(blocker_id, blocked_id, PRIMARY KEY(blocker_id, blocked_id))-- catalogcities(id, name, slug, enabled, launch_at, flags JSONB)categories(id, parent_id, name, slug, restricted BOOL, attributes_schema JSONB)-- listingsitems(id, owner_id, title, description, category_id,      condition ENUM('new','like_new','good','fair','parts'),      est_value_paise BIGINT, est_value_min_paise, est_value_max_paise,      value_source ENUM('user','ai','market'), value_confidence NUMERIC,      location GEOGRAPHY(Point), location_label,      status ENUM('draft','active','paused','locked','traded','removed','expired'),      locked_by_trade_id NULL, search_tsv TSVECTOR, embedding VECTOR(768) NULL,      expires_at, published_at, deleted_at)item_images(id, item_id, url, width, height, position, nsfw_score, phash)wanted_preferences(id, item_id, category_id NULL, keywords TEXT[], item_type TEXT NULL,                   min_condition, max_value_paise NULL, open_to_cash BOOL, open_to_anything BOOL,                   max_distance_m INT, embedding VECTOR(768) NULL)saved_items(user_id, item_id, created_at)saved_searches(id, user_id, query JSONB, notify BOOL)-- offersoffers(id, thread_id, version INT, proposer_id, recipient_id,       status ENUM('pending','countered','accepted','rejected','withdrawn','expired'),       cash_paise BIGINT DEFAULT 0, cash_direction ENUM('none','proposer_pays','recipient_pays'),       message, expires_at, parent_offer_id NULL, origin ENUM('manual','match','chain'))offer_items(offer_id, item_id, side ENUM('proposer','recipient'), PRIMARY KEY(offer_id,item_id))offer_threads(id, item_a_id, user_a_id, user_b_id, latest_offer_id, status)-- trades (supports 2..N participants)trades(id, kind ENUM('direct','chain'), chain_id NULL,       status ENUM('scheduling','scheduled','partially_confirmed','completed','cancelled','disputed'),       source_offer_id NULL, scheduled_at, meetup_place JSONB, cancelled_reason, completed_at)trade_participants(id, trade_id, user_id, gives_item_id, receives_item_id,                   cash_in_paise, cash_out_paise, accepted_at, handover_code_hash,                   confirmed_received_at, status ENUM('invited','accepted','confirmed','declined','no_show'))trade_handoffs(id, trade_id, from_user_id, to_user_id, item_id, status, confirmed_at)trade_events(id, trade_id, actor_id, type, payload JSONB, at)  -- append only-- chainschain_proposals(id, status ENUM('proposed','accepted','dissolved','expired'),                score NUMERIC, expires_at, created_by ENUM('engine','user'), explanation JSONB)chain_proposal_edges(id, chain_id, position, from_user_id, from_item_id, to_user_id, to_item_id, edge_score)chain_acceptances(chain_id, user_id, decision ENUM('pending','accepted','declined'), decided_at)-- chatconversations(id, thread_id, kind ENUM('offer','chain'), created_at)conversation_members(conversation_id, user_id, last_read_message_id, muted)messages(id, conversation_id, sender_id, type ENUM('text','image','system'), body, media_url, created_at, deleted_at)-- reviews, moderation, notificationsreviews(id, trade_id, reviewer_id, reviewee_id, stars, tags TEXT[], comment, revealed_at, UNIQUE(trade_id,reviewer_id,reviewee_id))reports(id, reporter_id, target_type, target_id, reason, details, status, handled_by, resolution)moderation_actions(id, admin_id, target_type, target_id, action, reason, at)notifications(id, user_id, type, payload JSONB, read_at, sent_channels TEXT[])notification_prefs(user_id, channel, type, enabled)-- matching and analyticsmatch_candidates(id, item_a_id, item_b_id, score, factors JSONB, computed_at, shown_count, clicked, converted_offer_id)match_feedback(id, user_id, match_id, action ENUM('shown','dismissed','clicked','offered'), at)-- billing (v1.0)plans(id, code, price_paise, interval), subscriptions(id, user_id, plan_id, store, store_ref, status, period_end)promotions(id, item_id, user_id, starts_at, ends_at, price_paise, store_ref)

### 6.2 Indexes and constraints

items: GIST on location; GIN on search_tsv; trigram on title; HNSW on embedding; partial index WHERE status='active'; btree (category_id, status, published_at DESC).

offers: partial unique index to allow only one active (pending) offer per thread_id.

trade_participants: unique (trade_id, user_id).

A check ensures an item appears in at most one non-terminal trade: enforce via items.locked_by_trade_id plus transaction SELECT ... FOR UPDATE.

Row-level security is optional; the primary control is service-level authorisation.

## 7. Key state machines

Offer: pending → accepted | rejected | countered | withdrawn | expired; countered creates a new pending version.

Trade: scheduling → scheduled → partially_confirmed → completed; any non-terminal → cancelled; completed or partially_confirmed → disputed.

Chain proposal: proposed → (all accepted within 24 h) → accepted → creates a trades row of kind chain; or any decline or timeout → dissolved / expired.

Item: draft → active → locked (on trade creation) → traded (on completion) or back to active (on cancel). paused, removed, expired side states.

Every transition: runs in a DB transaction, checks guard conditions, writes trade_events, emits a domain event after commit (outbox pattern).

## 8. Locking and concurrency

Offer acceptance: transaction locks both items (FOR UPDATE), verifies status='active', sets locked, creates trade, cancels competing pending offers for those items (notify senders).

Chain acceptance: each user accepting records chain_acceptances. When the last accepts, a single transaction locks all N items in a stable id order (prevents deadlock), re-validates each edge, then creates the chain trade. If any item became unavailable, the chain dissolves and everyone is notified.

Idempotency: all mutating endpoints accept an Idempotency-Key header; stored in Redis for 24 h.

Outbox: outbox_events table drained by a worker to BullMQ, which guarantees notifications even if the process dies after commit.

## 9. Matching engine

### 9.1 Pipeline

Candidate generation (on listing publish, edit, want change; nightly full recompute): PostGIS radius filter + category and keyword filter + pgvector similarity (from v0.3) → top 50 candidates per direction.

Hard filters: not blocked, within both users' max distance, min condition satisfied, value within tolerance (after cash), neither item locked.

Scoring: M = 0.30·I + 0.25·V + 0.20·L + 0.15·C + 0.10·P.

Persist match_candidates; surface in feed "Matches for you" and notifications; mutual 2-way matches (both sides want each other) are boosted.

Learn: log match_feedback; offline job tunes weights (logistic regression on accepted vs rejected) from v1.0.

### 9.2 Edge definition

Edge A.item → B.item exists when B.item satisfies A's wants and passes hard filters. Edge weight = score(A wants B.item).

### 9.3 3-cycle detection (v1.0)

build adjacency lists from top-K edges per node (K=50), active items only, same cityfor each node a (processed in id order):  for b in out(a) where b > a:    if a in out(b): emit 2-cycle (a,b)         # direct mutual match    for c in out(b) where c > a and c != b:      if a in out(c): emit 3-cycle (a,b,c)    # a<b<c canonical ordering dedupsrank by min(edge_score), then low total cash imbalance, then low total travel distancekeep top N cycles per item; suppress cycles seen and declined in last 14 days

Complexity is roughly O(V · K²) given the degree cap, so it is safe for tens of thousands of items. Run as a BullMQ job every 10 minutes per city, plus incremental runs on new listings.

### 9.4 Chain feasibility checks

Cash imbalance for each participant must be within their limit; a chain may include cash legs but never one requiring the platform to move funds. Cash is paid peer-to-peer at the meetup.

All participants within a common meetup radius (default 8 km); the engine suggests a meetup point from a curated safe_points table nearest to the centroid.

No participant may appear twice; no blocked pairs.

### 9.5 Chain handover protocol (local, v1.0)

Because the participants meet physically, v1.0 uses a single meetup where all N people (3) are present, or a pair of sequential meetups (A↔B, B↔C) with confirmations. A trade is completed only when every handoff row is confirmed. If one handoff fails, remaining participants may confirm cancellation and items are unlocked; items already physically exchanged are handled through the dispute flow (see 10.4).

## 10. API design

REST over HTTPS, JSON, versioned /v1. Auth via Authorization: Bearer <access JWT> (15 min) and refresh tokens (30 days, rotating). Errors follow RFC 9457 problem+json. Pagination: cursor-based. Rate limits per IP and per user.

### 10.1 Endpoint catalogue

| Area | Endpoints |
| --- | --- |
| Auth | POST /v1/auth/otp/request, POST /v1/auth/otp/verify, POST /v1/auth/google, POST /v1/auth/apple, POST /v1/auth/refresh, POST /v1/auth/logout |
| Users | GET/PATCH /v1/me, GET /v1/users/:id, POST /v1/users/:id/block, DELETE /v1/me, POST /v1/me/export, POST /v1/me/push-token |
| Media | POST /v1/media/upload-url, POST /v1/media/:id/complete |
| Catalog | GET /v1/categories, GET /v1/cities |
| Listings | POST/GET/PATCH/DELETE /v1/items, POST /v1/items/:id/publish, POST /v1/items/:id/pause, GET /v1/me/items |
| Wants | PUT /v1/items/:id/wants |
| Discovery | GET /v1/feed, GET /v1/search, GET /v1/items/:id/matches, POST/GET /v1/saved-searches, POST/DELETE /v1/saved-items/:id |
| Offers | POST /v1/offers, GET /v1/offers/:id, `POST /v1/offers/:id/accept |
| Trades | GET /v1/trades/:id, POST /v1/trades/:id/schedule, POST /v1/trades/:id/confirm (body: handover code), POST /v1/trades/:id/cancel, POST /v1/trades/:id/dispute |
| Chains | GET /v1/me/chain-proposals, `POST /v1/chains/:id/accept |
| Chat | GET /v1/conversations, GET /v1/conversations/:id/messages, POST /v1/conversations/:id/messages, POST /v1/conversations/:id/read |
| Reviews | POST /v1/trades/:id/reviews, GET /v1/users/:id/reviews |
| Moderation | POST /v1/reports |
| AI | POST /v1/ai/identify (image ids → title, category, description, value range), POST /v1/ai/value |
| Notifications | GET /v1/notifications, POST /v1/notifications/read, GET/PUT /v1/notification-prefs |
| Billing (v1.0) | POST /v1/billing/verify-receipt, GET /v1/plans, POST /v1/promotions |
| Admin | GET /v1/admin/reports, POST /v1/admin/items/:id/remove, POST /v1/admin/users/:id/suspend, GET /v1/admin/metrics, GET /v1/admin/audit |

### 10.2 Sample contract: create offer

POST /v1/offers{  "recipientItemId": "uuid",  "offeredItemIds": ["uuid", "uuid"],  "cash": { "amountPaise": 150000, "direction": "proposer_pays" },  "message": "Happy to add a bit for the lens."}

Response 201: offer object, thread id, expiry. Errors: 409 ITEM_LOCKED, 403 BLOCKED, 422 VALIDATION, 429 RATE_LIMITED.

### 10.3 Realtime events (Socket.IO)

Namespace /rt; rooms user:{id}, conv:{id}. Events: message.new, message.read, typing, offer.updated, trade.updated, chain.proposed, chain.updated, notification.new. Clients must also work with polling fallback and re-sync on reconnect via GET ...?after=<cursor>.

### 10.4 Dispute flow

POST /trades/:id/dispute opens a case, freezes the trade, notifies admin queue. Outcomes: resolved, warning or suspension, review removal. The platform does not refund money or compel return; it records outcomes, adjusts reputation and may ban.

## 11. Auth and security

JWT access (RS256, 15 min) plus rotating refresh tokens hashed at rest; reuse detection revokes the session family.

OTP: 6 digits, hashed, 5-min TTL, per-number and per-IP rate limits, device fingerprint check, SMS pumping protection.

Authorisation: policy layer (can(user, action, resource)) in every service method; admin roles moderator, admin, superadmin.

Input validation with zod or class-validator; output DTO whitelists.

Upload security: signed URLs, MIME sniffing, size limits (10 MB), re-encode images, strip EXIF GPS, virus scan queue.

PII: phone and email encrypted at rest (application-level field encryption) and never returned to other users; location rounded to a 1 km grid for public APIs.

Secrets in cloud secret manager; no secrets in the repo; Dependabot and npm audit in CI.

Protection: WAF, bot protection on OTP endpoints, CORS allowlist, CSP, HSTS.

Logging: no PII or tokens in logs; audit log for admin actions.

## 12. AI design

AiProvider interface: identify(images) -> {title, category, brand, model, attributes, description, confidence}, valuate(item) -> {min, max, currency, confidence, basis}, embed(text) -> vector, moderate(image|text) -> flags.

Run asynchronously: upload → job → result pushed to client; the UI shows skeleton suggestions and the user always edits.

Valuation uses Gemini with structured JSON output plus our own historical accepted-trade data as it accumulates (weighted blend). Show as "Estimated range, not a market price".

Embeddings computed for title + description + attributes (items) and for wants text.

Prompt injection hygiene: treat all listing text as untrusted data; never execute instructions found in it; strict JSON schema validation on outputs.

Cost controls: cache by image hash, per-user daily caps, small model for moderation.

## 13. Media pipeline

Client requests signed upload URL → uploads directly to R2 → calls complete → worker creates thumbnails (320, 720, 1440 px, WebP), computes pHash, runs NSFW and text-in-image moderation → marks item_images ready. CDN caching with immutable hashed URLs.

## 14. Notifications

Channel router: in-app (always), push (FCM), email (digest and critical), SMS (OTP only). Templates are versioned and localised. Events: new offer, counter, accept, reject, expiring offer (12 h before), new message (batched when the app is open), new match, chain proposal, chain reminder, meetup reminder, review prompt, moderation notices. Quiet hours 22:00 to 08:00 local except OTP.

## 15. Infrastructure and DevOps

| Environment | Purpose |
| --- | --- |
| local | docker-compose: Postgres+PostGIS+pgvector, Redis, MinIO (R2 stand-in), MailHog |
| dev | Auto-deploy on merge to main |
| staging | Release candidates, seeded data, load tests |
| production | Tagged releases, blue-green or rolling |

CI (GitHub Actions): install, lint, typecheck, unit tests, integration tests (Testcontainers), OpenAPI diff check, build, Docker image, deploy.

Database migrations: Prisma Migrate plus raw SQL for PostGIS and pgvector; backwards-compatible (expand then contract).

Backups: daily snapshots, point-in-time recovery, restore drill every quarter.

Mobile CI: EAS Build and Submit; OTA updates through EAS Update for JS-only fixes.

Feature flags: simple table-backed flags (or PostHog flags) with per-city targeting.

## 16. Quality, testing and observability

| Layer | Strategy |
| --- | --- |
| Unit | Jest for services, matching scoring, state machines (target 80% on matching, offers, trades) |
| Integration | API with real Postgres via Testcontainers; concurrency tests on locking |
| Contract | OpenAPI schema validation, SDK generation check |
| E2E web | Playwright |
| E2E mobile | Maestro (or Detox) happy paths: login, list, offer, accept, chat, confirm |
| Load | k6: feed, offer create, chat fan-out; target 200 RPS read, 20 RPS write at p95 under 300 ms |
| Security | OWASP ZAP baseline, dependency scanning, pre-launch penetration test |
| Observability | Request tracing, SLOs (availability, latency), alerts on OTP failure rate, push failures, job backlog, error rate |

Scaling path: read replicas → split workers → Redis cluster → move search to Meilisearch/Typesense → extract matching and chat only if metrics demand it.

## 17. Build plan: phases and tasks (backend)

Task IDs are referenced by platform docs. Each task should be one PR with tests.

### Phase 0 — Foundations (v0.0)

BE-0.1 Monorepo, TS configs, lint, commit hooks

BE-0.2 NestJS app, config module, health endpoints, Pino logging, Sentry

BE-0.3 Docker compose; Prisma and raw SQL migrations; PostGIS, pgvector

BE-0.4 CI pipeline; OpenAPI generation; packages/api-sdk generation

BE-0.5 Seed script: cities, categories, sample users and items

### Phase 1 — Core Marketplace (v0.1)

BE-1.1 Auth: phone OTP, Google, Apple, JWT, refresh rotation, rate limits

BE-1.2 Users and profile, blocks, deletion and export

BE-1.3 Media: signed upload, processing worker, moderation hook

BE-1.4 Listings CRUD, wants, status machine, prohibited-item checks

BE-1.5 Discovery: feed (distance, recency), search (FTS+trgm), filters, saved items

BE-1.6 Offers: create, counter, accept, reject, withdraw, expiry job, locking

BE-1.7 Trades: state machine, participants, schedule, handover codes, events

BE-1.8 Chat: Socket.IO gateway, persistence, read receipts, system messages

BE-1.9 Notifications: push token registry, FCM, in-app, email, preferences

BE-1.10 Reviews and reputation aggregation

BE-1.11 Reports, moderation actions, admin endpoints, audit log

BE-1.12 Analytics events, PostHog integration, basic metrics view

BE-1.13 Hardening: rate limits, idempotency, load test, security review

Exit: PRD Phase 1 gate.

### Phase 2 — Smart Matching Lite (v0.2)

BE-2.1 Candidate generation and scoring service with unit tests

BE-2.2 match_candidates persistence, feed integration, mutual-match boost

BE-2.3 Saved searches with alerts

BE-2.4 Match feedback logging; matching dashboard

### Phase 3 — AI Assist (v0.3)

BE-3.1 AiProvider interface, Gemini adapter, caching and cost caps

BE-3.2 Identify endpoint and async job; description and category suggestions

BE-3.3 Valuation with ranges; feedback capture

BE-3.4 Embeddings and pgvector candidate search

BE-3.5 Match explanation generator

### Phase 4 — Chains and Launch (v1.0)

BE-4.1 Graph builder and 3-cycle detector with property tests

BE-4.2 Chain proposals, acceptances, dissolve and expiry jobs

BE-4.3 Chain trade creation with ordered locking and handoff tracking

BE-4.4 Safe points table and meetup suggestion

BE-4.5 ID verification flow (partner SDK) and badges

BE-4.6 Billing: store receipt verification, Plus, featured promotions

BE-4.7 Terraform, production hardening, runbooks, pen test fixes

### Phase 5 — Scale (v1.5 to v2.0)

BE-5.1 i18n for notifications; second city enablement

BE-5.2 4-cycle search and coordinated handovers

BE-5.3 Delivery partner integration abstraction

BE-5.4 Business accounts and bulk APIs

BE-5.5 Weight tuning pipeline; search engine migration

## 18. Agent rules (put in .cursor/rules or .clinerules)

- Read docs/03-system-design.md and the relevant platform doc before coding.- Work one task ID at a time; one PR per task; include tests.- Never access another module's tables directly; use its service.- Never write money-movement code; cash is metadata only.- Every state transition: transaction + trade_events + outbox event.- All endpoints: DTO validation, authorisation policy check, rate limit decorator.- Do not log PII or tokens.- Use generated api-sdk on clients; do not hand-write fetch calls.- Prefer boring, well-typed code; no new dependencies without justification in the PR.
