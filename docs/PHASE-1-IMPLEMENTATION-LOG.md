# Xchange — Phase 1 (`v0.1 "Concierge Beta"`) Implementation & Line-by-Line Change Log

This document records every file created or modified during **Phase 1 — Core Marketplace (`v0.1`)**, covering Backend tasks `BE-1.1` through `BE-1.13` and Web tasks `WEB-1.1` through `WEB-1.15`.

---

## 1. Shared Schemas, Masking Guard & Typed API SDK (`packages/shared`, `packages/api-sdk`)
| File Path | Lines | Detailed Description of Code & Changes |
| :--- | :--- | :--- |
| `packages/shared/src/phase1-schemas.ts` | `1–116` | Zod schemas (`CreateItemSchema`, `UpdateProfileSchema`, `CounterOfferSchema`, `ScheduleTradeSchema`, `ConfirmHandoverSchema`, `CreateReviewSchema`, `CreateReportSchema`) and `maskSensitiveChatContent()` (`FR-CHT-2`). |
| `packages/shared/src/phase1-dtos.ts` | `1–194` | DTO interfaces (`MarketplaceItemDto`, `OfferDto`, `SafeMeetupPointDto`, `TradeEventDto`, `TradeParticipantDto`, `TradeDto`, `ChatMessageDto`, `ConversationDto`, `ReviewDto`, `NotificationDto`, `AdminReportDto`, `AdminMetricsDto`). |
| `packages/shared/src/phase1.ts` | `1–2` | Barrel re-export for `phase1-schemas` and `phase1-dtos`. |
| `packages/shared/src/index.ts` | `4` | Added `export * from "./phase1";`. |
| `packages/api-sdk/src/index.ts` | `8–32, 239–452` | Added typed SDK methods for all Phase 1 endpoints (`googleSignIn`, `updateProfile`, `exportMyData`, `requestUploadUrl`, `getFeed`, `getItemById`, `getMyItems`, `createItem`, `updateItemStatus`, `toggleSaveItem`, `getOffers`, `createOffer`, `counterOffer`, `acceptOffer`, `rejectOffer`, `withdrawOffer`, `getTrades`, `getTradeById`, `scheduleTrade`, `confirmTradeHandover`, `cancelTrade`, `disputeTrade`, `getConversations`, `getMessages`, `sendMessage`, `submitReview`, `getNotifications`, `markNotificationsRead`, `createReport`, `getAdminDashboard`, `resolveAdminReport`). |

---

## 2. Backend Modular Monolith (`apps/api` — `BE-1.1` to `BE-1.13`)
| File Path | Lines | Detailed Description of Code & Changes |
| :--- | :--- | :--- |
| `apps/api/src/modules/auth/auth.service.ts` | `207–263` | Added `googleSignIn()` (`BE-1.1`) and `updateProfile()` (`BE-1.2`). |
| `apps/api/src/modules/marketplace/marketplace.seed.ts` | `1–187` | Curated Bengaluru `SAFE_MEETUP_POINTS` and initial marketplace store. |
| `apps/api/src/modules/marketplace/listings.service.ts` | `1–128` | `requestSignedUploadUrl()` (`BE-1.3`), `getItemById()`, `getMyItems()`, `createItem()`, and `updateItemStatus()` (`BE-1.4`). |
| `apps/api/src/modules/marketplace/discovery.service.ts` | `1–49` | `getFeed()` (`for_you`, `nearby`, `new` sorting, keyword search, filters) and `toggleSaveItem()` (`BE-1.5`). |
| `apps/api/src/modules/marketplace/offers.service.ts` | `1–198` | `getOffers()`, `createOffer()`, `counterOffer()`, `updateOfferState()`, and `acceptOffer()` (atomic item locking, competing offer cancellation, conversation unmasking, `trade.created` audit event) (`BE-1.6`). |
| `apps/api/src/modules/marketplace/trades.service.ts` | `1–145` | `getTrades()`, `getTradeById()`, `scheduleTrade()`, `confirmHandover()` (6-digit code verification), `cancelTrade()`, and `disputeTrade()` (`BE-1.7`). |
| `apps/api/src/modules/marketplace/reviews.service.ts` | `1–55` | `submitReview()` with double-blind reveal and `review.double_blind_revealed` audit event (`BE-1.10`). |
| `apps/api/src/modules/marketplace/chat-admin.service.ts` | `1–137` | `Idempotency-Key` cache (`BE-1.13`), `getConversations()`, `getMessages()`, `sendMessage()` with pre-accept phone/URL masking (`BE-1.8`), `getNotifications()`, `markNotificationsRead()` (`BE-1.9`), `createReport()`, `getAdminDashboard()`, and `resolveAdminReport()` (`BE-1.11`, `BE-1.12`). |
| `apps/api/src/modules/marketplace/marketplace.router.ts` | `1–225` | Mounted all Phase 1 REST endpoints under `/v1/*`. |
| `apps/api/src/app.ts` | `12–29, 103–111` | Wired `handleMarketplaceRoute` into the HTTP server pipeline. |
| `apps/api/src/api.test.ts` | `84–206` | Phase 1 E2E integration tests (`WEB-1.15`). |

---

## 3. Next.js 15 Web Application (`apps/web` — `WEB-1.1` to `WEB-1.15`)
| File Path | Lines | Detailed Description of Code & Changes |
| :--- | :--- | :--- |
| `apps/web/src/components/layout/AppShell.tsx` | `11–18` | Updated navigation rail and mobile dock with `/feed`, `/items/new`, `/my-items`, `/offers`, `/trades`, `/chat`, and `/admin`. |
| `apps/web/src/app/feed/page.tsx` | `1–156` | Discovery Feed screen (`WEB-1.6`). |
| `apps/web/src/app/items/new/page.tsx` | `1–179` | Listing Creator (`WEB-1.3`, `WEB-1.4`). |
| `apps/web/src/app/my-items/page.tsx` | `1–107` | My Items Inventory manager (`WEB-1.5`). |
| `apps/web/src/app/offers/page.tsx` | `1–160` | Offers Inbox & Negotiation Studio (`WEB-1.8`). |
| `apps/web/src/app/trades/page.tsx` | `1–168` | Active Trades & Handover Studio (`WEB-1.10`, `WEB-1.11`). |
| `apps/web/src/app/chat/page.tsx` | `1–137` | Offer Chat & Notifications Center (`WEB-1.9`, `WEB-1.12`). |
| `apps/web/src/app/admin/page.tsx` | `1–145` | Admin Console MVP (`WEB-1.14`). |
| `apps/web/src/web.test.mjs` | `9–24` | Updated route verification suite for all Phase 0 + Phase 1 web screens. |
