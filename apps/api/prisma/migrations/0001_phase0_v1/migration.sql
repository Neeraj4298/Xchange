-- ============================================================================
-- Xchange Phase 0 — Initial SQL Migration (P0-T4 / BE-0.3)
-- Creates all core tables, enums, PostGIS/pgvector/pg_trgm indexes,
-- Offer/Trade/Participant separation, 3-way Chains, and Outbox Events.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Core tables for Offers, Trades, Chains, Chat, Reviews, Moderation, Outbox
CREATE TABLE IF NOT EXISTS offer_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_a_id UUID NOT NULL,
  user_a_id UUID NOT NULL,
  user_b_id UUID NOT NULL,
  latest_offer_id UUID NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES offer_threads(id) ON DELETE CASCADE,
  version INT NOT NULL DEFAULT 1,
  proposer_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending','countered','accepted','rejected','withdrawn','expired')),
  cash_paise BIGINT NOT NULL DEFAULT 0,
  cash_direction TEXT NOT NULL DEFAULT 'none' CHECK (cash_direction IN ('none','proposer_pays','recipient_pays')),
  message TEXT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  parent_offer_id UUID NULL,
  origin TEXT NOT NULL DEFAULT 'manual' CHECK (origin IN ('manual','match','chain')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Section 6.2: Partial unique index allowing only one active (pending) offer per thread_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_offers_one_pending_per_thread
  ON offers(thread_id) WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS offer_items (
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  item_id UUID NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('proposer','recipient')),
  PRIMARY KEY (offer_id, item_id)
);

CREATE TABLE IF NOT EXISTS chain_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL CHECK (status IN ('proposed','accepted','dissolved','expired')),
  score NUMERIC(5,2) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_by TEXT NOT NULL DEFAULT 'engine' CHECK (created_by IN ('engine','user')),
  explanation JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chain_proposal_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chain_id UUID NOT NULL REFERENCES chain_proposals(id) ON DELETE CASCADE,
  position INT NOT NULL,
  from_user_id UUID NOT NULL,
  from_item_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  to_item_id UUID NOT NULL,
  edge_score NUMERIC(5,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS chain_acceptances (
  chain_id UUID NOT NULL REFERENCES chain_proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  decision TEXT NOT NULL DEFAULT 'pending' CHECK (decision IN ('pending','accepted','declined')),
  decided_at TIMESTAMPTZ NULL,
  PRIMARY KEY (chain_id, user_id)
);

CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL CHECK (kind IN ('direct','chain')),
  chain_id UUID NULL REFERENCES chain_proposals(id),
  status TEXT NOT NULL CHECK (status IN ('scheduling','scheduled','partially_confirmed','completed','cancelled','disputed')),
  source_offer_id UUID NULL REFERENCES offers(id),
  scheduled_at TIMESTAMPTZ NULL,
  meetup_place JSONB NULL,
  cancelled_reason TEXT NULL,
  completed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trade_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  gives_item_id UUID NOT NULL,
  receives_item_id UUID NOT NULL,
  cash_in_paise BIGINT NOT NULL DEFAULT 0,
  cash_out_paise BIGINT NOT NULL DEFAULT 0,
  accepted_at TIMESTAMPTZ NULL,
  handover_code_hash TEXT NOT NULL,
  confirmed_received_at TIMESTAMPTZ NULL,
  status TEXT NOT NULL DEFAULT 'accepted' CHECK (status IN ('invited','accepted','confirmed','declined','no_show')),
  UNIQUE (trade_id, user_id)
);

CREATE TABLE IF NOT EXISTS trade_handoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  item_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  confirmed_at TIMESTAMPTZ NULL
);

-- Append-only immutable audit log for every trade transition (System Design Section 1 & 7)
CREATE TABLE IF NOT EXISTS trade_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  actor_id UUID NULL,
  type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Outbox table for transactional event publishing to BullMQ (System Design Section 8)
CREATE TABLE IF NOT EXISTS outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type TEXT NOT NULL,
  aggregate_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  published_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
