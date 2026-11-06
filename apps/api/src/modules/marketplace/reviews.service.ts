import crypto from "node:crypto";
import { CreateReviewSchema, type ReviewDto } from "@xchange/shared";
import { AuthServiceError } from "../auth/auth.service";
import type { MarketplaceStateStore } from "./marketplace.seed";

export class ReviewsService {
  constructor(private readonly store: MarketplaceStateStore) {}

  public submitReview(tradeId: string, rawInput: unknown) {
    const trade = this.store.trades.find((t) => t.id === tradeId);
    if (!trade) throw new AuthServiceError(404, "NOT_FOUND", "Trade not found", "Missing.");
    const parsed = CreateReviewSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new AuthServiceError(422, "VALIDATION", "Invalid review", "1..5 stars required.");
    }
    const p0 = trade.participants[0]!;
    const p1 = trade.participants[1]!;

    const rev1: ReviewDto = {
      id: crypto.randomUUID(),
      tradeId: trade.id,
      reviewerId: p1.userId,
      reviewerName: p1.userName,
      revieweeId: p0.userId,
      revieweeName: p0.userName,
      stars: parsed.data.stars,
      tags: parsed.data.tags,
      comment: parsed.data.comment || "Smooth handover at the safe point!",
      revealed: true,
      createdAt: new Date().toISOString(),
    };
    const rev2: ReviewDto = {
      id: crypto.randomUUID(),
      tradeId: trade.id,
      reviewerId: p0.userId,
      reviewerName: p0.userName,
      revieweeId: p1.userId,
      revieweeName: p1.userName,
      stars: 5,
      tags: ["accurate_listing", "punctual", "friendly"],
      comment: "Item exactly as described. Great exchange!",
      revealed: true,
      createdAt: new Date().toISOString(),
    };
    this.store.reviews.unshift(rev1, rev2);
    this.store.tradeEvents.unshift({
      id: crypto.randomUUID(),
      tradeId: trade.id,
      actorId: p1.userId,
      actorName: p1.userName,
      type: "review.double_blind_revealed",
      payload: { starsGiven: rev1.stars },
      at: new Date().toISOString(),
    });
    return { reviews: [rev1, rev2] };
  }
}
