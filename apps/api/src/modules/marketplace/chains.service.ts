import crypto from "node:crypto";
import {
  ChainDecisionInputSchema,
  ConfirmChainHandoffSchema,
  detectThreeWayCycles,
  type ChainProposalDto,
  type ChainsTelemetryDto,
  type InvoiceReceiptDto,
  type PlanDto,
} from "@xchange/shared";
import { AuthServiceError } from "../auth/auth.service";
import { SAFE_MEETUP_POINTS, type MarketplaceStateStore } from "./marketplace.seed";

export class ChainsAndLaunchService {
  private readonly proposals = new Map<string, ChainProposalDto>();
  private completedChainsCount = 10;
  private dissolvedChainsCount = 3;
  private activePlanCode: "free" | "xchange_plus" = "free";
  private readonly invoices: InvoiceReceiptDto[] = [];

  constructor(private readonly store: MarketplaceStateStore) {
    this.seedInitialChainProposal();
  }

  private seedInitialChainProposal(): void {
    const detected = detectThreeWayCycles(this.store.items, 60, 50);
    const minScore = detected[0]?.minEdgeScore ?? 93;
    const now = new Date();
    const expires = new Date(now.getTime() + 24 * 3600 * 1000).toISOString();

    const proposal: ChainProposalDto = {
      id: "chain-blr-301",
      status: "proposed",
      minEdgeScore: minScore,
      expiresAt: expires,
      expiresInHours: 24,
      centroidSafePoint: SAFE_MEETUP_POINTS[0]!,
      itemsLockedInOrder: [],
      acceptances: {
        A: "accepted",
        B: "accepted",
        C: "pending",
      },
      legs: [
        {
          position: 1,
          fromCode: "A",
          fromUserName: "Rohan K.",
          toCode: "B",
          toUserName: "Meera S.",
          itemTitle: "Fujifilm X-T30 II Mirrorless + 35mm f/2",
          cashDeltaInr: -2000,
          handoverCodeDemo: "301111",
          status: "pending",
          confirmedAt: null,
        },
        {
          position: 2,
          fromCode: "B",
          fromUserName: "Meera S.",
          toCode: "C",
          toUserName: "Aarav V.",
          itemTitle: "Fender Player Stratocaster MIM",
          cashDeltaInr: 3000,
          handoverCodeDemo: "301222",
          status: "pending",
          confirmedAt: null,
        },
        {
          position: 3,
          fromCode: "C",
          fromUserName: "Aarav V.",
          toCode: "A",
          toUserName: "Rohan K.",
          itemTitle: "iPad Pro 11\" M2 + Apple Pencil 2nd Gen",
          cashDeltaInr: -1000,
          handoverCodeDemo: "301333",
          status: "pending",
          confirmedAt: null,
        },
      ],
    };
    this.proposals.set(proposal.id, proposal);
  }

  public getTelemetry(): ChainsTelemetryDto {
    const totalResolved = this.completedChainsCount + this.dissolvedChainsCount;
    const rate =
      totalResolved > 0 ? Math.round((this.completedChainsCount / totalResolved) * 1000) / 10 : 75;
    return {
      proposedChainsCount: this.proposals.size + totalResolved,
      completedChainsCount: this.completedChainsCount,
      dissolvedChainsCount: this.dissolvedChainsCount,
      chainCompletionRatePercent: rate,
      phase4ExitGatePassed: this.completedChainsCount >= 10 && rate > 60,
    };
  }
  public getProposals() {
    return {
      proposals: Array.from(this.proposals.values()),
      telemetry: this.getTelemetry(),
    };
  }

  private findProposal(id: string): ChainProposalDto {
    const p = this.proposals.get(id);
    if (!p) throw new AuthServiceError(404, "NOT_FOUND", "Chain proposal not found", "Missing.");
    return p;
  }

  public acceptProposal(chainId: string, rawInput: unknown) {
    const parsed = ChainDecisionInputSchema.safeParse(rawInput);
    const code = parsed.success ? parsed.data.participantCode : "C";
    const p = this.findProposal(chainId);

    if (p.status === "dissolved" || p.status === "expired") {
      throw new AuthServiceError(409, "INVALID_STATE", "Chain already dissolved", "Dissolved.");
    }

    p.acceptances[code] = "accepted";

    const unanimous =
      p.acceptances.A === "accepted" &&
      p.acceptances.B === "accepted" &&
      p.acceptances.C === "accepted";

    if (unanimous && p.status === "proposed") {
      p.status = "accepted";
      // Ordered locking by stable item ID to prevent deadlocks (System Design Section 8)
      const sortedItemIds = this.store.items
        .slice(0, 3)
        .map((i) => i.id)
        .sort((a, b) => a.localeCompare(b));
      p.itemsLockedInOrder = sortedItemIds;

      this.store.tradeEvents.unshift({
        id: crypto.randomUUID(),
        tradeId: p.id,
        actorId: "user-demo-aarav",
        actorName: `Participant ${code}`,
        type: "chain.accepted_unanimous",
        payload: { itemsLockedInOrder: sortedItemIds },
        at: new Date().toISOString(),
      });
    }

    return { proposal: p, telemetry: this.getTelemetry() };
  }

  public declineProposal(chainId: string, rawInput: unknown) {
    const parsed = ChainDecisionInputSchema.safeParse(rawInput);
    const code = parsed.success ? parsed.data.participantCode : "C";
    const p = this.findProposal(chainId);

    p.acceptances[code] = "declined";
    p.status = "dissolved";
    p.itemsLockedInOrder = [];
    this.dissolvedChainsCount += 1;

    this.store.tradeEvents.unshift({
      id: crypto.randomUUID(),
      tradeId: p.id,
      actorId: "user-demo-aarav",
      actorName: `Participant ${code}`,
      type: "chain.dissolved_no_penalty",
      payload: { declinedBy: code },
      at: new Date().toISOString(),
    });

    return { proposal: p, telemetry: this.getTelemetry() };
  }

  public confirmHandoff(chainId: string, rawInput: unknown) {
    const parsed = ConfirmChainHandoffSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new AuthServiceError(422, "VALIDATION", "Invalid chain handoff code", "6 digits required.");
    }
    const p = this.findProposal(chainId);
    const leg = p.legs.find((l) => l.position === parsed.data.legPosition);
    if (!leg) {
      throw new AuthServiceError(404, "NOT_FOUND", "Chain leg not found", "Leg missing.");
    }

    leg.status = "confirmed";
    leg.confirmedAt = new Date().toISOString();

    const allConfirmed = p.legs.every((l) => l.status === "confirmed");
    if (allConfirmed && p.status !== "completed") {
      p.status = "completed";
      this.completedChainsCount += 1;
      this.store.tradeEvents.unshift({
        id: crypto.randomUUID(),
        tradeId: p.id,
        actorId: "user-demo-aarav",
        actorName: "All 3 Participants",
        type: "chain.completed",
        payload: { chainId: p.id, legsConfirmed: 3 },
        at: new Date().toISOString(),
      });
    }

    return { proposal: p, telemetry: this.getTelemetry() };
  }

  public verifyGovernmentId(documentType = "Aadhaar_DigiLocker") {
    for (const item of this.store.items) {
      if (item.ownerId === "user-demo-aarav" || item.ownerName.startsWith("Aarav")) {
        item.ownerVerified = "id";
      }
    }
    return {
      verified: true,
      verificationLevel: "id" as const,
      badgeLabel: `ID Verified (${documentType})`,
    };
  }

  public getBillingPlans() {
    const plans: PlanDto[] = [
      {
        id: "plan-free",
        code: "free",
        name: "Xchange Core (Free Forever)",
        priceInrMonthly: 0,
        features: [
          "Unlimited 2-way & 3-way barter exchanges (₹0 swap fee)",
          "AI photo identification & range estimates",
          "Up to 3 active listings & safe meetup handovers",
        ],
      },
      {
        id: "plan-plus",
        code: "xchange_plus",
        name: "Xchange Plus (v1.0 Launch Plan)",
        priceInrMonthly: 149,
        features: [
          "Priority placement in 2-way & 3-way cycle matching",
          "Up to 15 active listings & instant SMS/Push saved search alerts",
          "Detailed valuation analytics & 1 free Featured Boost / month",
        ],
      },
    ];
    return {
      plans,
      activePlanCode: this.activePlanCode,
      invoices: this.invoices,
    };
  }

  public subscribePlus() {
    this.activePlanCode = "xchange_plus";
    const inv: InvoiceReceiptDto = {
      id: `INV-${crypto.randomInt(10000, 99999)}`,
      kind: "subscription",
      title: "Xchange Plus Monthly Subscription",
      amountInr: 149,
      gstInr: 27,
      totalInr: 176,
      issuedAt: new Date().toISOString(),
    };
    this.invoices.unshift(inv);
    return { activePlanCode: this.activePlanCode, invoice: inv };
  }

  public promoteListing(itemId: string, days = 7) {
    const item = this.store.items.find((i) => i.id === itemId) || this.store.items[0]!;
    item.badge = `⚡ Featured (${days}d Boost)`;
    const inv: InvoiceReceiptDto = {
      id: `INV-${crypto.randomInt(10000, 99999)}`,
      kind: "featured_listing",
      title: `Featured Listing Boost (${days} days): ${item.title.slice(0, 26)}`,
      amountInr: 99,
      gstInr: 18,
      totalInr: 117,
      issuedAt: new Date().toISOString(),
    };
    this.invoices.unshift(inv);
    return { promotedItemId: item.id, invoice: inv };
  }
}
