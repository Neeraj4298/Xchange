import { z } from "zod";
import { evaluatePairFactors } from "./phase2";
import type { MarketplaceItemDto, SafeMeetupPointDto } from "./phase1-dtos";

export interface DirectedSwapEdge {
  fromItemId: string;
  toItemId: string;
  score: number;
  cashDeltaInr: number;
  distanceKm: number;
}

export interface DetectedThreeCycle {
  itemIds: [string, string, string];
  minEdgeScore: number;
  totalCashMovementInr: number;
  totalDistanceKm: number;
}

/**
 * System Design Section 9.3: O(V * K^2) Canonical 3-Cycle Detector (BE-4.1).
 * Uses canonical ordering (a < b < c) to deduplicate 3-way cycles (A -> B -> C -> A)
 * and ranks by min(edge_score) DESC, totalCashMovement ASC, totalDistance ASC.
 */
export function detectThreeWayCycles(
  items: MarketplaceItemDto[],
  minScoreThreshold = 65,
  degreeCapK = 50
): DetectedThreeCycle[] {
  const active = [...items]
    .filter((i) => i.status === "active")
    .sort((a, b) => a.id.localeCompare(b.id));

  const outEdges = new Map<string, Map<string, DirectedSwapEdge>>();

  for (const a of active) {
    const candidates: DirectedSwapEdge[] = [];
    for (const b of active) {
      if (a.id === b.id || a.ownerId === b.ownerId) continue;
      const evalRes = evaluatePairFactors(a, b);
      if (evalRes.score >= minScoreThreshold) {
        const midA = (a.estValueMinPaise + a.estValueMaxPaise) / 200;
        const midB = (b.estValueMinPaise + b.estValueMaxPaise) / 200;
        const cashDeltaInr = Math.min(5000, Math.round(Math.abs(midA - midB) * 0.25));
        candidates.push({
          fromItemId: a.id,
          toItemId: b.id,
          score: evalRes.score,
          cashDeltaInr,
          distanceKm: b.distanceKm,
        });
      }
    }
    candidates.sort((x, y) => y.score - x.score);
    const capped = candidates.slice(0, degreeCapK);
    outEdges.set(
      a.id,
      new Map(capped.map((edge) => [edge.toItemId, edge]))
    );
  }

  const cycles: DetectedThreeCycle[] = [];
  for (let i = 0; i < active.length; i++) {
    const a = active[i]!;
    const outA = outEdges.get(a.id);
    if (!outA) continue;

    for (const [bId, edgeAB] of outA.entries()) {
      if (bId.localeCompare(a.id) <= 0) continue; // enforce b > a
      const outB = outEdges.get(bId);
      if (!outB) continue;

      for (const [cId, edgeBC] of outB.entries()) {
        if (cId.localeCompare(a.id) <= 0 || cId === bId) continue; // enforce c > a and c != b
        const outC = outEdges.get(cId);
        const edgeCA = outC?.get(a.id);
        if (edgeCA) {
          const minEdgeScore = Math.min(edgeAB.score, edgeBC.score, edgeCA.score);
          const totalCashMovementInr =
            edgeAB.cashDeltaInr + edgeBC.cashDeltaInr + edgeCA.cashDeltaInr;
          const totalDistanceKm =
            Math.round((edgeAB.distanceKm + edgeBC.distanceKm + edgeCA.distanceKm) * 10) / 10;
          cycles.push({
            itemIds: [a.id, bId, cId],
            minEdgeScore,
            totalCashMovementInr,
            totalDistanceKm,
          });
        }
      }
    }
  }

  return cycles.sort((x, y) => {
    if (y.minEdgeScore !== x.minEdgeScore) return y.minEdgeScore - x.minEdgeScore;
    if (x.totalCashMovementInr !== y.totalCashMovementInr) {
      return x.totalCashMovementInr - y.totalCashMovementInr;
    }
    return x.totalDistanceKm - y.totalDistanceKm;
  });
}

export const ChainDecisionInputSchema = z.object({
  participantCode: z.enum(["A", "B", "C"]).default("C"),
});
export type ChainDecisionInput = z.infer<typeof ChainDecisionInputSchema>;

export const ConfirmChainHandoffSchema = z.object({
  legPosition: z.number().int().min(1).max(3),
  handoverCode: z.string().regex(/^\d{6}$/),
});
export type ConfirmChainHandoffInput = z.infer<typeof ConfirmChainHandoffSchema>;

export interface ChainHandoffLegDto {
  position: 1 | 2 | 3;
  fromCode: "A" | "B" | "C";
  fromUserName: string;
  toCode: "A" | "B" | "C";
  toUserName: string;
  itemTitle: string;
  cashDeltaInr: number;
  handoverCodeDemo: string;
  status: "pending" | "confirmed";
  confirmedAt?: string | null;
}

export interface ChainProposalDto {
  id: string;
  status: "proposed" | "accepted" | "completed" | "dissolved" | "expired";
  minEdgeScore: number;
  expiresAt: string;
  expiresInHours: number;
  centroidSafePoint: SafeMeetupPointDto;
  itemsLockedInOrder: string[];
  acceptances: Record<"A" | "B" | "C", "pending" | "accepted" | "declined">;
  legs: ChainHandoffLegDto[];
}

export interface ChainsTelemetryDto {
  proposedChainsCount: number;
  completedChainsCount: number;
  dissolvedChainsCount: number;
  chainCompletionRatePercent: number;
  phase4ExitGatePassed: boolean;
}

export interface PlanDto {
  id: string;
  code: "free" | "xchange_plus";
  name: string;
  priceInrMonthly: number;
  features: string[];
}

export interface InvoiceReceiptDto {
  id: string;
  kind: "subscription" | "featured_listing";
  title: string;
  amountInr: number;
  gstInr: number;
  totalInr: number;
  issuedAt: string;
}
