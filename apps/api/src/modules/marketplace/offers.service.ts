import crypto from "node:crypto";
import {
  CounterOfferSchema,
  type OfferDto,
  type TradeDto,
  type TradeEventDto,
} from "@xchange/shared";
import { AuthServiceError } from "../auth/auth.service";
import { SAFE_MEETUP_POINTS, type MarketplaceStateStore } from "./marketplace.seed";

export class OffersService {
  constructor(private readonly store: MarketplaceStateStore) {}

  public getOffers(tab?: string) {
    let list = [...this.store.offers];
    if (tab === "accepted") list = list.filter((o) => o.status === "accepted");
    else if (tab === "closed") {
      list = list.filter((o) =>
        ["rejected", "withdrawn", "expired", "countered"].includes(o.status)
      );
    }
    return { items: list };
  }

  public createOffer(rawInput: {
    recipientItemId: string;
    offeredItemIds: string[];
    cash?: { amountPaise: number; direction: "none" | "proposer_pays" | "recipient_pays" };
    message?: string;
  }) {
    const recipientItem = this.store.items.find((i) => i.id === rawInput.recipientItemId);
    if (!recipientItem) {
      throw new AuthServiceError(404, "NOT_FOUND", "Recipient item not found", "Item missing.");
    }
    if (recipientItem.status === "locked" || recipientItem.status === "traded") {
      throw new AuthServiceError(409, "ITEM_LOCKED", "Item unavailable", "Item locked/traded.");
    }
    const offeredItems = this.store.items.filter((i) => rawInput.offeredItemIds?.includes(i.id));
    if (offeredItems.length === 0) {
      throw new AuthServiceError(422, "VALIDATION", "No offered items found", "Select >= 1 item.");
    }
    for (const oi of offeredItems) {
      if (oi.status === "locked" || oi.status === "traded") {
        throw new AuthServiceError(409, "ITEM_LOCKED", "Offered item locked", `${oi.title} locked.`);
      }
    }

    const now = new Date();
    const offer: OfferDto = {
      id: crypto.randomUUID(),
      threadId: crypto.randomUUID(),
      version: 1,
      proposerId: offeredItems[0]!.ownerId,
      proposerName: offeredItems[0]!.ownerName,
      recipientId: recipientItem.ownerId,
      recipientName: recipientItem.ownerName,
      recipientItem,
      offeredItems,
      status: "pending",
      cashPaise: rawInput.cash?.amountPaise ?? 0,
      cashDirection: rawInput.cash?.direction ?? "none",
      message: rawInput.message || "Proposing a fair local swap!",
      origin: "manual",
      expiresAt: new Date(now.getTime() + 72 * 3600 * 1000).toISOString(),
      createdAt: now.toISOString(),
    };
    this.store.offers.unshift(offer);
    return { offer };
  }

  public counterOffer(offerId: string, rawInput: unknown) {
    const existing = this.store.offers.find((o) => o.id === offerId);
    if (!existing || existing.status !== "pending") {
      throw new AuthServiceError(409, "INVALID_STATE", "Offer not pending", "Cannot counter.");
    }
    const parsed = CounterOfferSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new AuthServiceError(422, "VALIDATION", "Invalid counteroffer", "Validation error.");
    }
    existing.status = "countered";
    const now = new Date();
    const counter: OfferDto = {
      ...existing,
      id: crypto.randomUUID(),
      version: existing.version + 1,
      proposerId: existing.recipientId,
      proposerName: existing.recipientName,
      recipientId: existing.proposerId,
      recipientName: existing.proposerName,
      status: "pending",
      cashPaise: parsed.data.cash?.amountPaise ?? existing.cashPaise,
      cashDirection: parsed.data.cash?.direction ?? existing.cashDirection,
      message: parsed.data.message || `Counteroffer v${existing.version + 1}`,
      expiresAt: new Date(now.getTime() + 72 * 3600 * 1000).toISOString(),
      createdAt: now.toISOString(),
    };
    this.store.offers.unshift(counter);
    return { offer: counter };
  }

  public updateOfferState(offerId: string, status: "rejected" | "withdrawn") {
    const offer = this.store.offers.find((o) => o.id === offerId);
    if (!offer || offer.status !== "pending") {
      throw new AuthServiceError(409, "INVALID_STATE", "Offer not pending", "Cannot update.");
    }
    offer.status = status;
    return { offer };
  }

  public acceptOffer(offerId: string) {
    const offer = this.store.offers.find((o) => o.id === offerId);
    if (!offer || offer.status !== "pending") {
      throw new AuthServiceError(409, "INVALID_STATE", "Offer not pending", "Cannot accept.");
    }
    const allItems = [offer.recipientItem, ...offer.offeredItems];
    for (const item of allItems) {
      const storeItem = this.store.items.find((i) => i.id === item.id);
      if (!storeItem || storeItem.status !== "active") {
        throw new AuthServiceError(409, "ITEM_LOCKED", "Item already locked", `${item.title} locked.`);
      }
    }

    const tradeId = crypto.randomUUID();
    for (const item of allItems) {
      const storeItem = this.store.items.find((i) => i.id === item.id)!;
      storeItem.status = "locked";
      storeItem.lockedByTradeId = tradeId;
    }

    const lockedIds = new Set(allItems.map((i) => i.id));
    for (const other of this.store.offers) {
      if (other.id !== offer.id && other.status === "pending") {
        const overlaps =
          lockedIds.has(other.recipientItem.id) ||
          other.offeredItems.some((oi) => lockedIds.has(oi.id));
        if (overlaps) other.status = "rejected";
      }
    }

    offer.status = "accepted";
    offer.tradeId = tradeId;
    for (const conv of this.store.conversations) {
      if (conv.threadId === offer.threadId) conv.tradeAccepted = true;
    }

    const ev: TradeEventDto = {
      id: crypto.randomUUID(),
      tradeId,
      actorId: offer.recipientId,
      actorName: offer.recipientName,
      type: "trade.created",
      payload: { sourceOfferId: offer.id, lockedItemIds: Array.from(lockedIds) },
      at: new Date().toISOString(),
    };
    this.store.tradeEvents.unshift(ev);

    const trade: TradeDto = {
      id: tradeId,
      kind: "direct",
      status: "scheduling",
      sourceOfferId: offer.id,
      scheduledAt: null,
      meetupPlace: SAFE_MEETUP_POINTS[0]!,
      createdAt: new Date().toISOString(),
      participants: [
        {
          userId: offer.proposerId,
          userName: offer.proposerName,
          givesItemId: offer.offeredItems[0]!.id,
          givesItemTitle: offer.offeredItems[0]!.title,
          receivesItemId: offer.recipientItem.id,
          receivesItemTitle: offer.recipientItem.title,
          cashInPaise: offer.cashDirection === "recipient_pays" ? offer.cashPaise : 0,
          cashOutPaise: offer.cashDirection === "proposer_pays" ? offer.cashPaise : 0,
          handoverCodeDemo: "849201",
          confirmedReceivedAt: null,
          status: "accepted",
        },
        {
          userId: offer.recipientId,
          userName: offer.recipientName,
          givesItemId: offer.recipientItem.id,
          givesItemTitle: offer.recipientItem.title,
          receivesItemId: offer.offeredItems[0]!.id,
          receivesItemTitle: offer.offeredItems[0]!.title,
          cashInPaise: offer.cashDirection === "proposer_pays" ? offer.cashPaise : 0,
          cashOutPaise: offer.cashDirection === "recipient_pays" ? offer.cashPaise : 0,
          handoverCodeDemo: "512904",
          confirmedReceivedAt: null,
          status: "accepted",
        },
      ],
      events: [ev],
    };

    this.store.trades.unshift(trade);
    return { offer, trade };
  }
}
