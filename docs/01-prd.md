# Xchange — Product Requirements Document (PRD)

Version: 1.0 | Status: Ready for build | Launch market: Bengaluru, India | Owner: Founder / Product

This is doc 1 of 6: 01 PRD, 02 BRD, 03 System Design, 04 Web Build Spec, 05 iOS Build Spec, 06 Android Build Spec. Feed docs 03 plus the relevant platform doc to Cursor, Cline or Antigravity as project context.

## 0. Decisions frozen for this PRD

The source brainstorm left six decisions open. These defaults are applied here; change them in one place if you disagree.

| Decision | Choice | Reason |
| --- | --- | --- |
| Brand | Xchange | Simple; revisit after validation |
| Users | Individuals only; students and young professionals first | Smallest trust surface |
| Chains | AI discovers, user approves every step, user-controlled setting to opt out | Safest consent model |
| Handover | Local meetups only (public safe points) | No shipping disputes in v1 |
| Verification | Phone OTP required; optional ID verification (v1.5) | Low friction, trust ladder |
| Launch city | Bengaluru, 3 to 5 adjacent neighbourhoods | Density beats breadth |
| Money | Optional cash adjustment agreed between users, no platform wallet, no credits, no held funds | Avoids regulated financial product |
| Platforms | Web (responsive) + Android first, iOS from same React Native codebase | Speed |

## 1. Product vision

Tagline: Own less. Exchange more.

Mission: Make exchanging possessions as easy as buying online.

Core insight: The product is not the listing; it is the matching engine that turns an impossible two-party swap into a possible multi-party one.

## 2. Problem statement

People hold unused items with real value but selling is slow, haggle-heavy and anonymous.

Classifieds (OLX, Facebook Marketplace) are money-first. Barter needs a double coincidence of wants, which classifieds cannot solve.

Existing swap apps (Sloop, Baater, Swapll, DeKeLe) have weak liquidity and limited coordination of multi-party trades. This is a hypothesis to validate by testing the real apps.

## 3. Goals and non-goals

Goals (first 90 days after launch)

G1: 1,000 registered users and 500 active listings in the launch cluster.

G2: North-star metric: successful exchanges per 100 active listings per month (target at least 8, an assumption to calibrate).

G3: Median time to first offer under 24 hours.

G4: Dispute rate under 3% of completed trades.

G5: Validate 3-way chains with at least 10 real completed cycles before investing in 4-way.

Non-goals for v1.x

Stored-value wallet, platform credits, escrow or fund holding.

Shipping or delivery.

Business accounts.

Vehicles and real estate (listed as restricted until legal review).

Services barter.

## 4. Personas

| Persona | Profile | Main need |
| --- | --- | --- |
| Aarav, student | 20, hostel, tight budget | Swap books, cycle, gadgets |
| Meera, young professional | 27, tech park, frequent upgrades | Swap electronics, furniture |
| Rohan, hobbyist | 32, musician or photographer | Swap instruments, lenses |
| Admin / Moderator | Internal | Review reports, remove listings, ban users |

## 5. Core user journey

List → Discover → Match → Offer / Negotiate → Meet and Exchange → Confirm → Review.

Principle: users never need to understand barter mechanics. They state what they have and what they want.

## 6. Functional requirements

Priority: P0 = must ship in that version, P1 = should, P2 = could.

### 6.1 Authentication and account (v0.1)

| ID | Requirement | Pri |
| --- | --- | --- |
| FR-AUTH-1 | Sign up and sign in with phone OTP | P0 |
| FR-AUTH-2 | Google sign-in; Apple sign-in on iOS (App Store rule) | P0 |
| FR-AUTH-3 | Email optional; recovery via phone | P1 |
| FR-AUTH-4 | Session refresh tokens, device list, logout all | P1 |
| FR-AUTH-5 | Account deletion and data export (DPDP rights) | P0 |

Acceptance: OTP expires in 5 minutes, max 5 attempts per hour per number, resend after 30 seconds, all rate-limited server-side.

### 6.2 Profile and reputation (v0.1)

| ID | Requirement | Pri |
| --- | --- | --- |
| FR-PRO-1 | Name, photo, neighbourhood (coarse), bio | P0 |
| FR-PRO-2 | Public profile: rating, completed trades, join date, verification badges | P0 |
| FR-PRO-3 | Block and report user | P0 |
| FR-PRO-4 | Privacy: exact address never shown; location rounded to approx 1 km grid | P0 |

### 6.3 Listings (v0.1)

| ID | Requirement | Pri |
| --- | --- | --- |
| FR-LST-1 | Create listing: 1 to 8 photos, title, description, category, condition (New, Like new, Good, Fair, For parts), estimated value (user-entered in v0.1), location | P0 |
| FR-LST-2 | Wants block: free-text plus structured categories and optional specific item types, plus "open to cash" and "open to anything" toggles | P0 |
| FR-LST-3 | Edit, pause, delete, mark as traded | P0 |
| FR-LST-4 | Prohibited-item checks at create time (keyword and category blocklist) | P0 |
| FR-LST-5 | Image compression, EXIF stripping, NSFW and duplicate-image moderation | P1 |
| FR-LST-6 | Listing expiry after 60 days with renewal prompt | P1 |

### 6.4 Discovery (v0.1)

| ID | Requirement | Pri |
| --- | --- | --- |
| FR-DIS-1 | Feed sorted by distance, recency and match score | P0 |
| FR-DIS-2 | Search by keyword | P0 |
| FR-DIS-3 | Filters: distance, category, value range, condition, recently listed | P0 |
| FR-DIS-4 | Save item (wishlist) | P1 |
| FR-DIS-5 | Saved searches and alerts | P1 (v0.2) |

### 6.5 Offers and negotiation (v0.1)

| ID | Requirement | Pri |
| --- | --- | --- |
| FR-OFF-1 | Offer types: 1:1, many:1, 1:many, with optional cash adjustment in either direction | P0 |
| FR-OFF-2 | Offer states: Pending, Countered, Accepted, Rejected, Withdrawn, Expired | P0 |
| FR-OFF-3 | Counteroffer creates a new offer version linked to the thread; one active version at a time | P0 |
| FR-OFF-4 | Offers expire after 72 hours by default | P0 |
| FR-OFF-5 | An item locked in an Accepted offer is hidden from new offers until trade completes or cancels | P0 |
| FR-OFF-6 | Both parties must explicitly accept; no auto-accept | P0 |

### 6.6 Chat and notifications (v0.1)

| ID | Requirement | Pri |
| --- | --- | --- |
| FR-CHT-1 | Real-time 1:1 chat tied to an offer thread, text plus images | P0 |
| FR-CHT-2 | Phone numbers and external links masked until trade accepted (reduce off-platform leakage) | P1 |
| FR-CHT-3 | System messages for offer events | P0 |
| FR-NOT-1 | Push (FCM / APNs), in-app and email for offer, message, trade events | P0 |

### 6.7 Trade lifecycle (v0.1)

Both accept → Trade created (SCHEDULING).

Participants propose a safe meetup point and time → SCHEDULED.

At meetup each party confirms received in app → PARTIALLY_CONFIRMED.

All confirmed → COMPLETED; items are marked traded; review prompts sent.

Cancel, no-show or dispute → CANCELLED or DISPUTED; items unlocked.

| ID | Requirement | Pri |
| --- | --- | --- |
| FR-TRD-1 | Trade state machine as above, immutable audit log of every transition | P0 |
| FR-TRD-2 | Safe meetup suggestions (malls, metro stations, police-station-adjacent points) | P1 |
| FR-TRD-3 | In-app handover code (6-digit) shown by each party to confirm in-person | P1 |
| FR-TRD-4 | Report a problem within 48 hours of completion | P0 |

### 6.8 Reviews, reports, moderation (v0.1)

| ID | Requirement | Pri |
| --- | --- | --- |
| FR-REV-1 | 1 to 5 stars plus tags (accurate listing, punctual, friendly) after completed trade; double-blind reveal | P0 |
| FR-MOD-1 | Report listing, user, message with reason | P0 |
| FR-MOD-2 | Admin dashboard: report queue, listing takedown, user suspend or ban, audit log | P0 |

### 6.9 Intelligence layer (v0.2 to v1.5)

| ID | Requirement | Version |
| --- | --- | --- |
| FR-AI-1 | Rule-based match scoring and "Matches for you" | v0.2 |
| FR-AI-2 | Photo to item identification, title, category, description suggestions (Gemini) | v0.3 |
| FR-AI-3 | Value range estimate with explicit "estimate only" label and a confidence band | v0.3 |
| FR-AI-4 | 2-way mutual-match detection and notification | v0.2 |
| FR-AI-5 | 3-way chain detection, "Chain proposal" flow | v1.0 |
| FR-AI-6 | Match explanations ("Why this match") | v0.3 |
| FR-AI-7 | 4-way chains and coordinated handovers | v2.0 |

## 7. Matching specification

Score M = 0.30·I + 0.25·V + 0.20·L + 0.15·C + 0.10·P, each factor 0 to 100. Weights are initial assumptions; log all outcomes to tune them.

I item preference compatibility (category, type, keyword overlap, later embedding similarity)

V value compatibility (value ratio; 100 when within 10%, decays linearly to 0 at 3x; cash adjustment lifts the score)

L location (100 within 3 km, 0 beyond the user's max distance)

C condition compatibility

P user preferences (blocked categories, delivery, cash openness)

Chain rules (v1.0):

Directed graph: node = active listing; edge A→B if B's item satisfies A's wants and passes hard filters (distance, condition, category, value tolerance after cash).

Search simple cycles of length 2 and 3 only; cap candidates per node (top 50 edges).

Rank cycles by minimum edge score, then total cash movement, then total travel.

Chain requires unanimous explicit accept within 24 hours; if any participant declines or times out, the chain dissolves and all items unlock with no penalty.

Items must not be locked by another trade; locking occurs only at the moment all participants accept.

Maximum cash imbalance per participant defaults to ₹5,000, which is user-configurable.

## 8. Trust and safety

Phone OTP verified for all users; optional ID verification (v1.5).

Prohibited items: weapons, drugs, alcohol, tobacco, adult items, counterfeit, stolen, prescription medicine, live animals, hazardous materials, vehicles and property at launch.

Reputation visible on cards; new accounts have limits (e.g. 3 active listings and 2 simultaneous accepted trades until first completed trade).

Strike system: warn, suspend, ban.

Safety nudges before meetups; share-trip link (v1.5).

## 9. Non-functional requirements

| Area | Requirement |
| --- | --- |
| Performance | API p95 under 300 ms for reads; feed under 1.5 s on 4G; app cold start under 3 s |
| Availability | 99.5% in v0.x, 99.9% from v1.0 |
| Scalability | Design for 100k users and 500k listings; no re-architecture until then |
| Security | OWASP ASVS L2, TLS everywhere, secrets in vault, PII encrypted at rest, rate limits, audit logs |
| Privacy | DPDP Act consent, purpose limitation, deletion workflow, grievance officer contact |
| Accessibility | WCAG 2.1 AA on web; screen-reader and Dynamic Type or font scaling support on mobile |
| Localisation | English at launch; i18n-ready for Kannada and Hindi (v1.5) |
| Observability | Structured logs, traces, error tracking, product analytics |
| Compliance | Review against Consumer Protection E-Commerce Rules and DPDP Rules before public launch; legal sign-off is a launch gate |

## 10. Analytics events (minimum set)

signup_completed, listing_created, listing_published, feed_viewed, item_viewed, offer_sent, offer_countered, offer_accepted, offer_rejected, message_sent, trade_scheduled, trade_completed, trade_cancelled, dispute_opened, review_submitted, match_shown, match_clicked, chain_proposed, chain_accepted, chain_dissolved, chain_completed.

## 11. Release plan, phases and tasks

Each version has an exit gate; do not start the next phase until it passes.

### Phase 0 — Foundations (v0.0, weeks 1 to 2)

P0-T1 Monorepo setup (pnpm workspaces: apps/web, apps/mobile, apps/api, packages/shared)

P0-T2 CI (lint, typecheck, test, build), preview deploys

P0-T3 Design system tokens, Figma component library

P0-T4 Postgres schema v1 and migrations, seed data

P0-T5 Auth service skeleton, environment config

P0-T6 Legal: privacy policy, terms, prohibited items policy drafts

Exit: a user can sign in on web and mobile and call a protected endpoint.

### Phase 1 — Core Marketplace (v0.1 "Concierge Beta", weeks 3 to 10)

Sprint 1: Profiles, categories, listing CRUD, image upload

Sprint 2: Discovery, search, filters, geo queries

Sprint 3: Offers, counteroffers, cash adjustment, expiry jobs

Sprint 4: Chat, notifications, trade state machine, reviews, reports, admin panel

Exit gate: 100 beta users, 150 listings, 20 completed trades, no P0 bugs, legal checklist signed.

### Phase 2 — Smart Matching Lite (v0.2, weeks 11 to 14)

Score engine, "Matches for you", 2-way mutual-match alerts, saved searches

Exit: at least 30% of offers originate from a recommendation.

### Phase 3 — AI Assist (v0.3, weeks 15 to 18)

Photo identification, description and category suggestions, value estimates with confidence band, match explanations

Exit: at least 60% of new listings use AI assist; listing time under 90 seconds.

### Phase 4 — Public Launch (v1.0, weeks 19 to 24)

3-way chain detection, chain proposal flow, chain trade lifecycle

Safe meetup suggestions, handover codes, optional ID verification, Xchange Plus subscription experiments

Exit: 10 completed 3-way chains, chain completion rate above 60%.

### Phase 5 — Scale (v1.5 to v2.0, after validation)

Kannada and Hindi, second city, 4-way chains, coordinated handovers, delivery partners (research), business accounts, trust score v2

## 12. Risks and mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Low liquidity | High | Single cluster, concierge matching, seeded listings, campus partnerships |
| Fraud and unsafe meetups | Medium | OTP, limits, ratings, safe points, reporting |
| Mis-valuation disputes | Medium | Estimates only, user-controlled value, cash adjustment |
| Chain failure (one party drops) | High | Unanimous accept, time boxes, no lock until all accept, no penalty dissolve |
| Regulatory change | Medium | Legal review, no money handling |
| Scope creep | High | Phase gates, this PRD as change-controlled source |

## 13. Open questions for validation

Will users accept 72 hours as offer expiry?

What cash imbalance is acceptable before users reject a match?

Is Xchange Plus at ₹149 per month viable, or should featured listings lead?

Which 3 to 5 Bengaluru neighbourhoods give the best density (candidates: HSR, Koramangala, Indiranagar, Whitefield)?
