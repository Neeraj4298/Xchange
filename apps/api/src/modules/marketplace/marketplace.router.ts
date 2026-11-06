import type { IncomingMessage, ServerResponse } from "node:http";
import { sendJson } from "../../common/problem-details";
import type { AuthService } from "../auth/auth.service";
import { createInitialMarketplaceStore } from "./marketplace.seed";
import { ListingsService } from "./listings.service";
import { DiscoveryService } from "./discovery.service";
import { OffersService } from "./offers.service";
import { TradesService } from "./trades.service";
import { ReviewsService } from "./reviews.service";
import { ChatAdminService } from "./chat-admin.service";
import { MatchingService } from "./matching.service";
import { AiAssistService } from "./ai.service";
import { ChainsAndLaunchService } from "./chains.service";

export function createMarketplaceRouter(authService: AuthService) {
  const store = createInitialMarketplaceStore();
  const listings = new ListingsService(store);
  const discovery = new DiscoveryService(store);
  const offers = new OffersService(store);
  const trades = new TradesService(store);
  const reviews = new ReviewsService(store);
  const chatAdmin = new ChatAdminService(store);
  const matching = new MatchingService(store);
  const aiAssist = new AiAssistService(store);
  const chainsAndLaunch = new ChainsAndLaunchService(store);

  return async function handleMarketplaceRoute(
    method: string,
    pathname: string,
    urlObj: URL,
    req: IncomingMessage,
    res: ServerResponse,
    readJsonBody: (r: IncomingMessage) => Promise<Record<string, unknown>>
  ): Promise<boolean> {
    const idemKey = req.headers["idempotency-key"] as string | undefined;
    if (method === "POST" && idemKey) {
      const cached = chatAdmin.checkIdempotency(idemKey);
      if (cached) {
        sendJson(res, cached.status, cached.body);
        return true;
      }
    }

    const respondWithIdem = (status: number, payload: unknown) => {
      if (method === "POST" && idemKey) {
        chatAdmin.saveIdempotency(idemKey, status, payload);
      }
      sendJson(res, status, payload);
    };

    if (method === "POST" && pathname === "/v1/auth/google") {
      const body = await readJsonBody(req);
      sendJson(res, 200, authService.googleSignIn(body as { email?: string; name?: string }));
      return true;
    }
    if (method === "PATCH" && pathname === "/v1/me") {
      const body = await readJsonBody(req);
      sendJson(res, 200, authService.updateProfile(body as { name?: string; neighbourhood?: string }));
      return true;
    }
    if (method === "POST" && pathname === "/v1/me/export") {
      sendJson(res, 200, {
        exportedAt: new Date().toISOString(),
        data: {
          items: listings.getMyItems().items,
          offers: offers.getOffers().items,
          trades: trades.getTrades().items,
        },
      });
      return true;
    }
    if (method === "POST" && pathname === "/v1/media/upload-url") {
      const body = await readJsonBody(req);
      sendJson(res, 200, listings.requestSignedUploadUrl(String(body.filename || "photo.webp")));
      return true;
    }
    if (method === "GET" && (pathname === "/v1/feed" || pathname === "/v1/search")) {
      sendJson(
        res,
        200,
        discovery.getFeed({
          tab: urlObj.searchParams.get("tab") || undefined,
          q: urlObj.searchParams.get("q") || undefined,
          category: urlObj.searchParams.get("category") || undefined,
          condition: urlObj.searchParams.get("condition") || undefined,
          maxDistanceKm: urlObj.searchParams.get("maxDistanceKm")
            ? Number(urlObj.searchParams.get("maxDistanceKm"))
            : undefined,
        })
      );
      return true;
    }
    if (method === "GET" && pathname === "/v1/me/items") {
      sendJson(res, 200, listings.getMyItems());
      return true;
    }
    if (method === "POST" && pathname === "/v1/items") {
      const body = await readJsonBody(req);
      respondWithIdem(201, listings.createItem(body));
      return true;
    }
    const itemActionMatch = pathname.match(/^\/v1\/items\/([^/]+)\/(publish|pause|delete)$/);
    if (method === "POST" && itemActionMatch) {
      sendJson(
        res,
        200,
        listings.updateItemStatus(
          itemActionMatch[1]!,
          itemActionMatch[2] as "publish" | "pause" | "delete"
        )
      );
      return true;
    }
    const itemDetailMatch = pathname.match(/^\/v1\/items\/([^/]+)$/);
    if (method === "GET" && itemDetailMatch) {
      sendJson(res, 200, listings.getItemById(itemDetailMatch[1]!));
      return true;
    }
    const saveItemMatch = pathname.match(/^\/v1\/saved-items\/([^/]+)$/);
    if ((method === "POST" || method === "DELETE") && saveItemMatch) {
      sendJson(res, 200, discovery.toggleSaveItem(saveItemMatch[1]!));
      return true;
    }

    if (method === "GET" && pathname === "/v1/offers") {
      sendJson(res, 200, offers.getOffers(urlObj.searchParams.get("tab") || undefined));
      return true;
    }
    if (method === "POST" && pathname === "/v1/offers") {
      const body = await readJsonBody(req);
      respondWithIdem(
        201,
        offers.createOffer(
          body as {
            recipientItemId: string;
            offeredItemIds: string[];
            cash?: { amountPaise: number; direction: "none" | "proposer_pays" | "recipient_pays" };
            message?: string;
          }
        )
      );
      return true;
    }
    const offerActionMatch = pathname.match(
      /^\/v1\/offers\/([^/]+)\/(counter|accept|reject|withdraw)$/
    );
    if (method === "POST" && offerActionMatch) {
      const [, id, act] = offerActionMatch;
      if (act === "counter") {
        const body = await readJsonBody(req);
        sendJson(res, 200, offers.counterOffer(id!, body));
      } else if (act === "accept") {
        respondWithIdem(200, offers.acceptOffer(id!));
      } else {
        sendJson(res, 200, offers.updateOfferState(id!, act as "rejected" | "withdrawn"));
      }
      return true;
    }

    if (method === "GET" && pathname === "/v1/trades") {
      sendJson(res, 200, trades.getTrades());
      return true;
    }
    const tradeDetailMatch = pathname.match(/^\/v1\/trades\/([^/]+)$/);
    if (method === "GET" && tradeDetailMatch) {
      sendJson(res, 200, trades.getTradeById(tradeDetailMatch[1]!));
      return true;
    }
    const tradeActionMatch = pathname.match(
      /^\/v1\/trades\/([^/]+)\/(schedule|confirm|cancel|dispute|reviews)$/
    );
    if (method === "POST" && tradeActionMatch) {
      const [, id, act] = tradeActionMatch;
      const body = await readJsonBody(req);
      if (act === "schedule") sendJson(res, 200, trades.scheduleTrade(id!, body));
      else if (act === "confirm") respondWithIdem(200, trades.confirmHandover(id!, body));
      else if (act === "cancel") sendJson(res, 200, trades.cancelTrade(id!, String(body.reason || "")));
      else if (act === "dispute") sendJson(res, 200, trades.disputeTrade(id!, String(body.reason || "")));
      else if (act === "reviews") sendJson(res, 201, reviews.submitReview(id!, body));
      return true;
    }

    if (method === "GET" && pathname === "/v1/conversations") {
      sendJson(res, 200, chatAdmin.getConversations());
      return true;
    }
    const convMessagesMatch = pathname.match(/^\/v1\/conversations\/([^/]+)\/messages$/);
    if (convMessagesMatch) {
      const convId = convMessagesMatch[1]!;
      if (method === "GET") {
        sendJson(res, 200, chatAdmin.getMessages(convId));
        return true;
      }
      if (method === "POST") {
        const body = await readJsonBody(req);
        sendJson(res, 201, chatAdmin.sendMessage(convId, String(body.body || "")));
        return true;
      }
    }
    if (method === "GET" && pathname === "/v1/notifications") {
      sendJson(res, 200, chatAdmin.getNotifications());
      return true;
    }
    if (method === "POST" && pathname === "/v1/notifications/read") {
      sendJson(res, 200, chatAdmin.markNotificationsRead());
      return true;
    }
    if (method === "POST" && pathname === "/v1/reports") {
      const body = await readJsonBody(req);
      sendJson(res, 201, chatAdmin.createReport(body));
      return true;
    }
    if (method === "GET" && pathname === "/v1/admin/dashboard") {
      sendJson(res, 200, chatAdmin.getAdminDashboard());
      return true;
    }
    const adminResolveMatch = pathname.match(/^\/v1\/admin\/reports\/([^/]+)\/resolve$/);
    if (method === "POST" && adminResolveMatch) {
      const body = await readJsonBody(req);
      sendJson(
        res,
        200,
        chatAdmin.resolveAdminReport(
          adminResolveMatch[1]!,
          (body.action as "dismiss" | "warn" | "remove_item" | "suspend_user") || "dismiss"
        )
      );
      return true;
    }

    // Phase 2 Smart Matching Lite & Saved Searches (BE-2.1..BE-2.4)
    if (method === "GET" && pathname === "/v1/matches") {
      sendJson(res, 200, matching.getMatches());
      return true;
    }
    const matchAction = pathname.match(/^\/v1\/matches\/([^/]+)\/(feedback|offer)$/);
    if (method === "POST" && matchAction) {
      const [, matchId, act] = matchAction;
      const body = await readJsonBody(req);
      if (act === "feedback") {
        sendJson(res, 200, matching.recordFeedback(matchId!, body));
      } else {
        sendJson(
          res,
          201,
          matching.createOfferFromMatch(
            matchId!,
            body as { cashPaise?: number; message?: string }
          )
        );
      }
      return true;
    }
    if (method === "GET" && pathname === "/v1/saved-searches") {
      sendJson(res, 200, matching.getSavedSearches());
      return true;
    }
    if (method === "POST" && pathname === "/v1/saved-searches") {
      const body = await readJsonBody(req);
      sendJson(res, 201, matching.createSavedSearch(body));
      return true;
    }
    const ssToggleMatch = pathname.match(/^\/v1\/saved-searches\/([^/]+)\/toggle-alert$/);
    if (method === "POST" && ssToggleMatch) {
      sendJson(res, 200, matching.toggleSavedSearchAlert(ssToggleMatch[1]!));
      return true;
    }
    const ssDeleteMatch = pathname.match(/^\/v1\/saved-searches\/([^/]+)$/);
    if (method === "DELETE" && ssDeleteMatch) {
      sendJson(res, 200, matching.deleteSavedSearch(ssDeleteMatch[1]!));
      return true;
    }

    // Phase 3 AI Assist Endpoints (BE-3.1..BE-3.5)
    if (method === "POST" && pathname === "/v1/ai/identify") {
      const body = await readJsonBody(req);
      sendJson(res, 200, aiAssist.identify(body));
      return true;
    }
    if (method === "POST" && pathname === "/v1/ai/value") {
      const body = await readJsonBody(req);
      sendJson(res, 200, aiAssist.estimateValue(body));
      return true;
    }
    if (method === "POST" && pathname === "/v1/ai/value-feedback") {
      const body = await readJsonBody(req);
      sendJson(res, 200, aiAssist.recordValuationFeedback(body));
      return true;
    }
    if (method === "POST" && pathname === "/v1/ai/semantic-search") {
      const body = await readJsonBody(req);
      sendJson(res, 200, aiAssist.semanticSearch(String(body.query || "")));
      return true;
    }
    if (method === "GET" && pathname === "/v1/ai/telemetry") {
      sendJson(res, 200, { telemetry: aiAssist.getTelemetry() });
      return true;
    }

    // Phase 4 Chains, ID Verification & Billing (BE-4.1..BE-4.7)
    if (method === "GET" && pathname === "/v1/me/chain-proposals") {
      sendJson(res, 200, chainsAndLaunch.getProposals());
      return true;
    }
    const chainAct = pathname.match(/^\/v1\/chains\/([^/]+)\/(accept|decline|confirm-handoff)$/);
    if (method === "POST" && chainAct) {
      const [, chainId, act] = chainAct;
      const body = await readJsonBody(req);
      if (act === "accept") {
        sendJson(res, 200, chainsAndLaunch.acceptProposal(chainId!, body));
      } else if (act === "decline") {
        sendJson(res, 200, chainsAndLaunch.declineProposal(chainId!, body));
      } else {
        sendJson(res, 200, chainsAndLaunch.confirmHandoff(chainId!, body));
      }
      return true;
    }
    if (method === "POST" && pathname === "/v1/me/verify-id") {
      const body = await readJsonBody(req);
      sendJson(res, 200, chainsAndLaunch.verifyGovernmentId(String(body.documentType || "Aadhaar_DigiLocker")));
      return true;
    }
    if (method === "GET" && pathname === "/v1/plans") {
      sendJson(res, 200, chainsAndLaunch.getBillingPlans());
      return true;
    }
    if (method === "POST" && pathname === "/v1/billing/subscribe") {
      sendJson(res, 200, chainsAndLaunch.subscribePlus());
      return true;
    }
    if (method === "POST" && pathname === "/v1/promotions") {
      const body = await readJsonBody(req);
      sendJson(res, 201, chainsAndLaunch.promoteListing(String(body.itemId || ""), Number(body.days || 7)));
      return true;
    }
    return false;
  };
}
