import crypto from "node:crypto";
import {
  CreateSavedSearchSchema,
  MatchFeedbackSchema,
  evaluatePairFactors,
  type MatchCandidateDto,
  type MatchingTelemetryDto,
  type OfferDto,
  type SavedSearchDto,
} from "@xchange/shared";
import { AuthServiceError } from "../auth/auth.service";
import type { MarketplaceStateStore } from "./marketplace.seed";

export class MatchingService {
  private readonly candidates = new Map<string, MatchCandidateDto>();
  private readonly savedSearches = new Map<string, SavedSearchDto>();

  constructor(private readonly store: MarketplaceStateStore) {
    this.recomputeCandidates();
    this.seedSavedSearches();
  }

  private seedSavedSearches(): void {
    const now = new Date().toISOString();
    const s1: SavedSearchDto = {
      id: "ss-seed-1",
      userId: "user-demo-aarav",
      query: "Fender Stratocaster / Electric Guitar",
      categorySlug: "musical-instruments",
      maxDistanceKm: 5,
      notify: true,
      matchingItemsCount: 2,
      createdAt: now,
    };
    const s2: SavedSearchDto = {
      id: "ss-seed-2",
      userId: "user-demo-aarav",
      query: "Fujifilm X-T30 II Mirrorless",
      categorySlug: "cameras-lenses",
      maxDistanceKm: 8,
      notify: true,
      matchingItemsCount: 1,
      createdAt: now,
    };
    this.savedSearches.set(s1.id, s1);
    this.savedSearches.set(s2.id, s2);
  }

  public recomputeCandidates(): MatchCandidateDto[] {
    const activeItems = this.store.items.filter((i) => i.status === "active");
    const myItem =
      activeItems.find((i) => i.ownerId === "user-demo-aarav" || i.ownerName.startsWith("Aarav")) ||
      activeItems[0];
    if (!myItem) return [];

    const others = activeItems.filter((i) => i.id !== myItem.id);
    for (const target of others) {
      const pairKey = `${myItem.id}:${target.id}`;
      const existing = this.candidates.get(pairKey);
      const forward = evaluatePairFactors(myItem, target);
      const reverse = evaluatePairFactors(target, myItem);

      const isMutualMatch =
        forward.factors.itemPreference >= 80 && reverse.factors.itemPreference >= 80;
      const boostedScore = isMutualMatch
        ? Math.min(99, Math.round((forward.score + reverse.score) / 2 + 4))
        : forward.score;

      const reasons = [...forward.reasons];
      if (isMutualMatch) {
        reasons.unshift(
          `⚡ 2-Way Mutual Match: ${target.ownerName} also wants what you own (${myItem.title.slice(0, 22)}...)`
        );
      }

      const candidate: MatchCandidateDto = {
        id: existing?.id || `match-${target.id.slice(-6)}`,
        myItem,
        targetItem: target,
        score: boostedScore,
        isMutualMatch,
        factors: forward.factors,
        reasons,
        shownCount: (existing?.shownCount ?? 0) + 1,
        clicked: existing?.clicked ?? false,
        dismissed: existing?.dismissed ?? false,
        convertedOfferId: existing?.convertedOfferId ?? null,
        computedAt: new Date().toISOString(),
      };
      this.candidates.set(pairKey, candidate);
    }

    return Array.from(this.candidates.values())
      .filter((c) => !c.dismissed)
      .sort((a, b) => {
        if (a.isMutualMatch !== b.isMutualMatch) return a.isMutualMatch ? -1 : 1;
        return b.score - a.score;
      });
  }
  public getTelemetry(): MatchingTelemetryDto {
    const all = Array.from(this.candidates.values());
    const totalOffers = Math.max(1, this.store.offers.length);
    const matchOffers = this.store.offers.filter((o) => o.origin === "match").length;
    const sharePercent = Math.round((matchOffers / totalOffers) * 1000) / 10;

    return {
      totalCandidates: all.length,
      mutualMatchesCount: all.filter((c) => c.isMutualMatch && !c.dismissed).length,
      dismissedCount: all.filter((c) => c.dismissed).length,
      clickedCount: all.filter((c) => c.clicked).length,
      totalOffersCount: totalOffers,
      matchOriginatedOffersCount: matchOffers,
      recommendationOfferSharePercent: sharePercent,
      phase2ExitGatePassed: sharePercent >= 30,
    };
  }

  public getMatches() {
    const items = this.recomputeCandidates();
    return {
      items,
      telemetry: this.getTelemetry(),
    };
  }

  private findById(matchId: string): MatchCandidateDto {
    for (const c of this.candidates.values()) {
      if (c.id === matchId) return c;
    }
    throw new AuthServiceError(404, "NOT_FOUND", "Match not found", `Match ${matchId} missing.`);
  }

  public recordFeedback(matchId: string, rawInput: unknown) {
    const parsed = MatchFeedbackSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new AuthServiceError(422, "VALIDATION", "Invalid match feedback", "Validation error.");
    }
    const candidate = this.findById(matchId);
    const { action } = parsed.data;
    if (action === "dismissed") candidate.dismissed = true;
    if (action === "clicked") candidate.clicked = true;
    if (action === "shown") candidate.shownCount += 1;
    return {
      match: candidate,
      telemetry: this.getTelemetry(),
    };
  }

  public createOfferFromMatch(
    matchId: string,
    rawInput: { cashPaise?: number; message?: string }
  ) {
    const candidate = this.findById(matchId);
    candidate.clicked = true;

    const now = new Date();
    const offer: OfferDto = {
      id: crypto.randomUUID(),
      threadId: crypto.randomUUID(),
      version: 1,
      proposerId: candidate.myItem.ownerId,
      proposerName: candidate.myItem.ownerName,
      recipientId: candidate.targetItem.ownerId,
      recipientName: candidate.targetItem.ownerName,
      recipientItem: candidate.targetItem,
      offeredItems: [candidate.myItem],
      status: "pending",
      cashPaise: rawInput.cashPaise ?? 0,
      cashDirection: (rawInput.cashPaise ?? 0) > 0 ? "proposer_pays" : "none",
      message:
        rawInput.message ||
        `Smart Match (${candidate.score}%): Swapping ${candidate.myItem.title} for ${candidate.targetItem.title}`,
      origin: "match",
      expiresAt: new Date(now.getTime() + 72 * 3600 * 1000).toISOString(),
      createdAt: now.toISOString(),
    };

    this.store.offers.unshift(offer);
    candidate.convertedOfferId = offer.id;

    if (candidate.isMutualMatch) {
      this.store.notifications.unshift({
        id: crypto.randomUUID(),
        userId: "user-demo-aarav",
        type: "match.mutual_offer",
        title: `⚡ 2-Way Mutual Match Offer Dispatched (${candidate.score}%)`,
        body: `Your mutual match offer to ${candidate.targetItem.ownerName} is live!`,
        readAt: null,
        createdAt: now.toISOString(),
      });
    }

    return {
      offer,
      telemetry: this.getTelemetry(),
    };
  }

  public getSavedSearches() {
    return { items: Array.from(this.savedSearches.values()) };
  }

  public createSavedSearch(rawInput: unknown) {
    const parsed = CreateSavedSearchSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new AuthServiceError(422, "VALIDATION", "Invalid saved search", "Validation failed.");
    }
    const d = parsed.data;
    const qLower = d.query.toLowerCase();
    const matchingCount = this.store.items.filter(
      (i) =>
        i.status === "active" &&
        (i.title.toLowerCase().includes(qLower) || i.description.toLowerCase().includes(qLower))
    ).length;

    const savedSearch: SavedSearchDto = {
      id: crypto.randomUUID(),
      userId: "user-demo-aarav",
      query: d.query,
      categorySlug: d.categorySlug,
      maxDistanceKm: d.maxDistanceKm,
      notify: d.notify,
      matchingItemsCount: Math.max(1, matchingCount),
      createdAt: new Date().toISOString(),
    };
    this.savedSearches.set(savedSearch.id, savedSearch);
    return { savedSearch };
  }

  public toggleSavedSearchAlert(id: string) {
    const found = this.savedSearches.get(id);
    if (!found) throw new AuthServiceError(404, "NOT_FOUND", "Saved search not found", "Missing.");
    found.notify = !found.notify;
    return { savedSearch: found };
  }

  public deleteSavedSearch(id: string) {
    this.savedSearches.delete(id);
    return { deleted: true };
  }
}
