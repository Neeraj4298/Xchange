import crypto from "node:crypto";
import {
  ConfirmHandoverSchema,
  ScheduleTradeSchema,
  type AdminReportDto,
  type TradeEventDto,
} from "@xchange/shared";
import { AuthServiceError } from "../auth/auth.service";
import { SAFE_MEETUP_POINTS, type MarketplaceStateStore } from "./marketplace.seed";

export class TradesService {
  constructor(private readonly store: MarketplaceStateStore) {}

  private appendEvent(
    tradeId: string,
    actorId: string,
    actorName: string,
    type: string,
    payload: Record<string, unknown>
  ): TradeEventDto {
    const ev: TradeEventDto = {
      id: crypto.randomUUID(),
      tradeId,
      actorId,
      actorName,
      type,
      payload,
      at: new Date().toISOString(),
    };
    this.store.tradeEvents.unshift(ev);
    const trade = this.store.trades.find((t) => t.id === tradeId);
    if (trade) trade.events.unshift(ev);
    return ev;
  }

  public getTrades() {
    return { items: this.store.trades, safePoints: SAFE_MEETUP_POINTS };
  }

  public getTradeById(id: string) {
    const trade = this.store.trades.find((t) => t.id === id);
    if (!trade) throw new AuthServiceError(404, "NOT_FOUND", "Trade not found", `Trade ${id} missing.`);
    return { trade, safePoints: SAFE_MEETUP_POINTS };
  }

  public scheduleTrade(tradeId: string, rawInput: unknown) {
    const trade = this.store.trades.find((t) => t.id === tradeId);
    if (!trade) throw new AuthServiceError(404, "NOT_FOUND", "Trade not found", "Missing.");
    const parsed = ScheduleTradeSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new AuthServiceError(422, "VALIDATION", "Invalid schedule input", "Validation failed.");
    }
    const sp =
      SAFE_MEETUP_POINTS.find((p) => p.id === parsed.data.safePointId) || SAFE_MEETUP_POINTS[0]!;
    trade.meetupPlace = sp;
    trade.scheduledAt = parsed.data.scheduledAt;
    trade.status = "scheduled";
    this.appendEvent(trade.id, "user-demo-aarav", "Aarav V.", "trade.scheduled", {
      safePointId: sp.id,
      safePointName: sp.name,
      scheduledAt: trade.scheduledAt,
    });
    return { trade };
  }

  public confirmHandover(tradeId: string, rawInput: unknown) {
    const trade = this.store.trades.find((t) => t.id === tradeId);
    if (!trade) throw new AuthServiceError(404, "NOT_FOUND", "Trade not found", "Missing.");
    const parsed = ConfirmHandoverSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new AuthServiceError(422, "VALIDATION", "Invalid 6-digit handover code", "6 digits required.");
    }

    const { handoverCode } = parsed.data;
    const matched = trade.participants.find(
      (p) => p.handoverCodeDemo === handoverCode && !p.confirmedReceivedAt
    );
    const target = matched || trade.participants.find((p) => !p.confirmedReceivedAt);
    if (!target) return { trade };

    target.confirmedReceivedAt = new Date().toISOString();
    target.status = "confirmed";

    const allConfirmed = trade.participants.every((p) => Boolean(p.confirmedReceivedAt));
    if (allConfirmed) {
      trade.status = "completed";
      trade.completedAt = new Date().toISOString();
      for (const p of trade.participants) {
        const item = this.store.items.find((i) => i.id === p.givesItemId);
        if (item) {
          item.status = "traded";
          item.lockedByTradeId = null;
        }
      }
      this.appendEvent(trade.id, target.userId, target.userName, "trade.completed", {
        handoverVerified: true,
      });
    } else {
      trade.status = "partially_confirmed";
      this.appendEvent(trade.id, target.userId, target.userName, "trade.partially_confirmed", {
        confirmedUser: target.userName,
      });
    }
    return { trade };
  }

  public cancelTrade(tradeId: string, reason = "User requested cancellation") {
    const trade = this.store.trades.find((t) => t.id === tradeId);
    if (!trade) throw new AuthServiceError(404, "NOT_FOUND", "Trade not found", "Missing.");
    trade.status = "cancelled";
    trade.cancelledReason = reason;
    for (const p of trade.participants) {
      const item = this.store.items.find((i) => i.id === p.givesItemId);
      if (item && item.status === "locked") {
        item.status = "active";
        item.lockedByTradeId = null;
      }
    }
    this.appendEvent(trade.id, "user-demo-aarav", "Aarav V.", "trade.cancelled", { reason });
    return { trade };
  }

  public disputeTrade(tradeId: string, reason = "Item condition mismatch") {
    const trade = this.store.trades.find((t) => t.id === tradeId);
    if (!trade) throw new AuthServiceError(404, "NOT_FOUND", "Trade not found", "Missing.");
    trade.status = "disputed";
    const report: AdminReportDto = {
      id: crypto.randomUUID(),
      reporterId: "user-demo-aarav",
      targetType: "trade",
      targetId: trade.id,
      reason,
      details: `Dispute opened within 48h window for trade ${trade.id}`,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    this.store.reports.unshift(report);
    this.appendEvent(trade.id, "user-demo-aarav", "Aarav V.", "trade.disputed", {
      reportId: report.id,
      reason,
    });
    return { trade, report };
  }
}
