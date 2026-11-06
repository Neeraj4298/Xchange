# Xchange — Web Application Build Spec (Next.js)

Version: 1.0 | Doc 4 of 6 | Depends on: 01 PRD, 03 System Design | Targets: responsive web, PWA, admin console

Use this doc as context for Cursor, Cline or Antigravity. Work one task ID (WEB-x.y) per PR. Backend task IDs (BE-x.y) are in doc 03.

## 1. Scope and goals

The web app serves three jobs:

Acquisition: SEO-indexed public listing pages that convert visitors to sign-ups.

Full product parity with mobile for core flows (list, discover, offer, chat, trade).

Admin console for moderation, analytics and operations (internal, role gated).

## 2. Stack and conventions

| Concern | Choice |
| --- | --- |
| Framework | Next.js (App Router), React, TypeScript strict |
| Styling | Tailwind CSS, shadcn/ui primitives, design tokens from packages/ui-tokens |
| Data fetching | Server Components for public pages; TanStack Query for authenticated client data; generated api-sdk |
| Forms | React Hook Form + zod (schemas from packages/shared) |
| State | URL state first; Zustand only for ephemeral UI state |
| Realtime | Socket.IO client wrapped in a useRealtime hook; TanStack Query cache updates on events |
| Maps | Mapbox GL or Google Maps JS behind <MapPicker/> and <MapView/> components |
| Auth | httpOnly secure cookies holding refresh token; access token in memory; Next middleware for route guards |
| Images | next/image with R2 CDN loader; client-side compression before upload |
| i18n | next-intl ready from day one (English only at launch) |
| Analytics | PostHog (consent gated) |
| Errors | Sentry |
| Tests | Vitest + React Testing Library; Playwright E2E; Storybook for components |
| PWA | Web manifest, service worker for offline shell, web push (v1.0) |

## 3. Folder structure

apps/web/  src/    app/      (marketing)/ page.tsx, how-it-works, safety, terms, privacy      (public)/ items/[id]/page.tsx, u/[id]/page.tsx, c/[category]/page.tsx, search/page.tsx      (auth)/ login, verify-otp      (app)/ feed, items/new, items/[id]/edit, my-items, offers, offers/[id],             trades/[id], chat, chat/[id], matches, chains, notifications, settings, profile      admin/ reports, listings, users, trades, metrics, audit      api/ (BFF routes only if needed: auth cookie handling, OG images)    components/ ui/, listing/, offer/, trade/, chat/, map/, layout/    features/ auth, listings, discovery, offers, trades, chat, reviews, matching, chains, billing    lib/ api-client.ts, realtime.ts, geo.ts, format.ts, analytics.ts    hooks/ styles/ middleware.ts

## 4. Design system essentials

Mobile-first breakpoints: 360, 768, 1024, 1280.

Tokens: color (brand, surface, text, success, warning, danger), spacing 4-pt grid, radius, elevation, type scale; light and dark theme.

Core components: Button, Input, Select, Chips, Tabs, Modal/Sheet, Toast, Avatar, Rating, ItemCard, OfferCard, TradeStepper, ChainDiagram, ChatBubble, ImageUploader, MapPicker, EmptyState, Skeleton.

Accessibility: WCAG 2.1 AA, visible focus, keyboard navigation, ARIA live regions for chat and toasts, reduced-motion support.

Performance budgets: LCP under 2.5 s on 4G, CLS under 0.1, route JS under 200 KB gzipped for public pages.

## 5. Screen specifications

### 5.1 Public

| Screen | Route | Key content and behaviour |
| --- | --- | --- |
| Landing | / | Value proposition, how it works, live local listing carousel, CTA to join; city selector |
| Item detail (public) | /items/[id] | SSR; photos, condition, approx location, "wants" list, owner rating; CTA "Make an offer" prompts login; JSON-LD Product markup, OG image |
| Category and search | /c/[category], /search | SSR filtered grid; canonical URLs; pagination |
| Public profile | /u/[id] | Rating, completed trades, active listings, reviews |
| Trust pages | /safety, /terms, /privacy, /prohibited-items | Static |

### 5.2 Authenticated

| Screen | Route | Spec |
| --- | --- | --- |
| Login / OTP | /login, /verify-otp | Phone input with +91 default, OTP with auto-advance, resend timer, Google button; error states for rate limits |
| Onboarding | modal flow | Name, neighbourhood (map pick), interests (categories), notification consent |
| Feed | /feed | Tabs: For you, Nearby, New. Filter bar (distance slider, category, value range, condition). Infinite scroll with cursor pagination. "Matches for you" rail from v0.2 |
| Create listing | /items/new | Stepper: Photos (drag and drop, reorder, up to 8) → Details (title, category, condition, value) → Wants (categories, keywords, open to cash toggle, open to anything) → Location → Review and publish. AI suggestions panel appears from v0.3 |
| My items | /my-items | Tabs: Active, Paused, In trade, Traded, Drafts; quick pause, edit, renew |
| Item detail (authed) | /items/[id] | Adds Make Offer, Save, Report, Share; if owner, shows incoming offers and matches |
| Make offer | modal/sheet | Pick one or more of your items, optional cash slider with direction, message, expiry notice, value delta indicator labelled "Estimates only" |
| Offers inbox | /offers | Tabs: Received, Sent, Accepted, Closed; badges; swipe or buttons accept, reject, counter |
| Offer detail | /offers/[id] | Timeline of versions, side-by-side items, counteroffer composer, chat panel |
| Trade detail | /trades/[id] | TradeStepper (Scheduling, Scheduled, Confirming, Completed), meetup picker with safe point suggestions, handover code display and entry, cancel, report problem |
| Chat | /chat, /chat/[id] | Two-pane on desktop; unread counts, typing indicator, image send, system messages inline, block and report menu |
| Matches | /matches | Match cards with score reasons ("Why this match"), actions: view, offer, dismiss |
| Chains | /chains | Chain proposals rendered with ChainDiagram (A → B → C → A), per-participant status, Accept and Decline, countdown timer, cash legs shown |
| Reviews | modal after trade | Stars, tags, comment; double-blind notice |
| Notifications | /notifications | List, mark read, preferences |
| Settings | /settings | Profile, privacy, blocked users, notification prefs, plan, delete account, data export |

### 5.3 Admin console (/admin, role gated, 2FA for admins)

| Screen | Functions |
| --- | --- |
| Reports queue | Filter by type and status; view context; actions: dismiss, warn, remove content, suspend, ban |
| Listings | Search; view history; remove; restore |
| Users | Search; verification state; strikes; suspend |
| Trades and disputes | Timeline from trade_events; resolve outcomes |
| Metrics | North-star dashboard, funnel, liquidity, chain metrics, cohort retention |
| Content policy | Keyword blocklist editor, restricted categories |
| Audit log | Immutable viewer |

## 6. State, caching and realtime rules

Query keys: ['items', filters], ['item', id], ['offers', tab], ['trade', id], ['conv', id, 'messages'].

Optimistic updates for chat sends and saves; no optimistic updates for offer acceptance or trade confirmation (wait for server).

Realtime events patch the cache: offer.updated invalidates ['offer', id] and ['offers']; message.new appends to the conversation; trade.updated invalidates ['trade', id].

On reconnect, refetch with after cursor to fill gaps.

Idempotency-Key generated per mutation attempt for create offer, accept, confirm.

## 7. Security (web specific)

Strict CSP with nonces; no inline scripts; Trusted Types where possible.

Refresh token in httpOnly, Secure, SameSite=Lax cookie; CSRF token on cookie-authenticated BFF routes.

Sanitise any user text rendered; never use dangerouslySetInnerHTML for user content.

Do not expose phone number or exact coordinates in the DOM.

Admin routes behind middleware plus server-side role check on every API call.

Cookie consent banner and analytics gating per DPDP notice.

## 8. SEO and growth

SSR/ISR for item, category, profile pages; sitemap generation per city; robots.txt; canonical tags; OG and Twitter cards with generated images.

Expired or traded item pages return 200 with a "Traded" state and related items, not 404, to preserve link equity for a limited period, then 410.

Share links with UTM and referral code capture; smart banner for the mobile app.

## 9. Environment and configuration

NEXT_PUBLIC_API_URL, NEXT_PUBLIC_WS_URL, NEXT_PUBLIC_MAPS_KEY,NEXT_PUBLIC_POSTHOG_KEY, SENTRY_DSN, NEXT_PUBLIC_CDN_URL,NEXT_PUBLIC_FEATURE_FLAGS_URL

Feature flags to read from /v1/config: ai.assist, matching.feed, chains, billing, city.<slug>.

## 10. Version-by-version build plan

### WEB Phase 0 — Foundations (v0.0)

WEB-0.1 Scaffold Next.js app in monorepo, Tailwind, shadcn/ui, tokens package, theme switcher

WEB-0.2 App shell: header, bottom nav (mobile), sidebar (desktop), route groups, middleware

WEB-0.3 api-sdk integration, TanStack Query provider, error boundary, toasts

WEB-0.4 Storybook with core components and visual states

WEB-0.5 Sentry, PostHog, CSP, Lighthouse CI budget

Exit: deployed preview shows shell and calls /health.

### WEB Phase 1 — Core Marketplace (v0.1)

WEB-1.1 Auth screens: phone OTP, Google; token handling; guards; logout everywhere

WEB-1.2 Onboarding and profile editor with MapPicker

WEB-1.3 ImageUploader (signed URL upload, progress, reorder, compression, retry)

WEB-1.4 Create and edit listing stepper; wants form; drafts autosave

WEB-1.5 My items management

WEB-1.6 Feed, filters, search, infinite scroll, saved items

WEB-1.7 SSR public pages: item, category, profile, SEO metadata, JSON-LD, sitemap

WEB-1.8 Make offer flow (multi-item, cash slider) and Offers inbox/detail with counter

WEB-1.9 Realtime provider and Chat UI (two-pane desktop, mobile stack)

WEB-1.10 Trade detail: stepper, schedule, handover code, cancel, report problem

WEB-1.11 Reviews modal and public reputation display

WEB-1.12 Notifications center and preferences

WEB-1.13 Report and block flows

WEB-1.14 Admin console MVP: reports queue, listings, users, trades, audit, basic metrics

WEB-1.15 Accessibility audit, E2E suite (Playwright): sign up → list → offer → accept → chat → confirm → review

Exit gate: PRD Phase 1 gate; Lighthouse performance 85 or above; no critical a11y issues.

### WEB Phase 2 — Smart Matching Lite (v0.2)

WEB-2.1 Matches page and "Matches for you" rail on feed

WEB-2.2 Mutual-match banner on item pages and in notifications

WEB-2.3 Saved searches with alert toggles

WEB-2.4 Match feedback (dismiss, not interested) wiring and analytics events

### WEB Phase 3 — AI Assist (v0.3)

WEB-3.1 AI suggestion panel in create flow (title, category, description, value range) with accept and edit controls

WEB-3.2 "Estimated range, not a market price" UI patterns and feedback thumbs

WEB-3.3 "Why this match" explanation chips

WEB-3.4 Loading, failure and fallback states for AI jobs

### WEB Phase 4 — Chains and Launch (v1.0)

WEB-4.1 ChainDiagram component (accessible SVG), chain proposal page, accept and decline with countdown

WEB-4.2 Chain trade detail: per-participant handover status and codes

WEB-4.3 Safe meetup picker with curated points map

WEB-4.4 ID verification flow and badges

WEB-4.5 Billing UI: Plus plan page, featured listing purchase (web payments via an approved provider; follow app-store rules for mobile only), invoices

WEB-4.6 Web push notifications, PWA install prompt

WEB-4.7 Admin: chain monitoring, policy editor, advanced metrics and cohort views

WEB-4.8 Performance, SEO and security pass; launch checklist

### WEB Phase 5 — Scale (v1.5 to v2.0)

WEB-5.1 Kannada and Hindi translations via next-intl

WEB-5.2 City switcher and multi-city SEO

WEB-5.3 4-party chain UI and coordinated handover timeline

WEB-5.4 Business account dashboard and bulk listing upload

## 11. Definition of done (every task)

Meets the acceptance criteria in the PRD requirement ID.

Typed end to end, using generated SDK, no any without comment.

Loading, empty, error and offline states implemented.

Unit or component tests plus a Storybook story for new components.

Keyboard and screen reader checked.

Analytics events emitted per PRD section 10.

Lighthouse and bundle budgets pass in CI.

## 12. Prompts to hand to the coding agent (examples)

"Implement WEB-1.4 per docs/04-web-spec.md section 5.2 'Create listing'. Use generated api-sdk endpoints POST /v1/items, PUT /v1/items/:id/wants, and POST /v1/items/:id/publish. Include zod schemas from packages/shared, autosave drafts, and Storybook stories."

"Implement WEB-1.9: realtime provider using Socket.IO against namespace /rt, patch TanStack Query caches per section 6, and build the two-pane Chat UI. Add reconnect gap-fill using the after cursor."
