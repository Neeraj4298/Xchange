/**
 * Domain Enums & Analytics Events (System Design Section 6.1 & PRD Section 10)
 */

export const USER_STATUSES = ["active", "suspended", "banned", "deleted"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const VERIFICATION_LEVELS = ["phone", "id"] as const;
export type VerificationLevel = (typeof VERIFICATION_LEVELS)[number];

export const AUTH_PROVIDERS = ["phone", "google", "apple"] as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

export const ITEM_CONDITIONS = ["new", "like_new", "good", "fair", "parts"] as const;
export type ItemCondition = (typeof ITEM_CONDITIONS)[number];

export const ITEM_STATUSES = [
  "draft",
  "active",
  "paused",
  "locked",
  "traded",
  "removed",
  "expired",
] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

export const VALUE_SOURCES = ["user", "ai", "market"] as const;
export type ValueSource = (typeof VALUE_SOURCES)[number];

export const OFFER_STATUSES = [
  "pending",
  "countered",
  "accepted",
  "rejected",
  "withdrawn",
  "expired",
] as const;
export type OfferStatus = (typeof OFFER_STATUSES)[number];

export const CASH_DIRECTIONS = ["none", "proposer_pays", "recipient_pays"] as const;
export type CashDirection = (typeof CASH_DIRECTIONS)[number];

export const OFFER_ORIGINS = ["manual", "match", "chain"] as const;
export type OfferOrigin = (typeof OFFER_ORIGINS)[number];

export const TRADE_KINDS = ["direct", "chain"] as const;
export type TradeKind = (typeof TRADE_KINDS)[number];

export const TRADE_STATUSES = [
  "scheduling",
  "scheduled",
  "partially_confirmed",
  "completed",
  "cancelled",
  "disputed",
] as const;
export type TradeStatus = (typeof TRADE_STATUSES)[number];

export const PARTICIPANT_STATUSES = [
  "invited",
  "accepted",
  "confirmed",
  "declined",
  "no_show",
] as const;
export type ParticipantStatus = (typeof PARTICIPANT_STATUSES)[number];

export const CHAIN_PROPOSAL_STATUSES = [
  "proposed",
  "accepted",
  "dissolved",
  "expired",
] as const;
export type ChainProposalStatus = (typeof CHAIN_PROPOSAL_STATUSES)[number];

export const CHAIN_DECISIONS = ["pending", "accepted", "declined"] as const;
export type ChainDecision = (typeof CHAIN_DECISIONS)[number];

export const ANALYTICS_EVENTS = [
  "signup_completed",
  "listing_created",
  "listing_published",
  "feed_viewed",
  "item_viewed",
  "offer_sent",
  "offer_countered",
  "offer_accepted",
  "offer_rejected",
  "message_sent",
  "trade_scheduled",
  "trade_completed",
  "trade_cancelled",
  "dispute_opened",
  "review_submitted",
  "match_shown",
  "match_clicked",
  "chain_proposed",
  "chain_accepted",
  "chain_dissolved",
  "chain_completed",
] as const;
export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];
