import crypto from "node:crypto";
import {
  CreateReportSchema,
  maskSensitiveChatContent,
  type AdminMetricsDto,
  type AdminReportDto,
  type ChatMessageDto,
} from "@xchange/shared";
import { AuthServiceError } from "../auth/auth.service";
import type { MarketplaceStateStore } from "./marketplace.seed";

export class ChatAdminService {
  private readonly idempotencyStore = new Map<string, { status: number; body: unknown }>();

  constructor(private readonly store: MarketplaceStateStore) {}

  public checkIdempotency(key?: string) {
    if (!key) return null;
    return this.idempotencyStore.get(key) || null;
  }

  public saveIdempotency(key: string | undefined, status: number, body: unknown) {
    if (!key) return;
    this.idempotencyStore.set(key, { status, body });
  }

  public getConversations() {
    return { items: this.store.conversations };
  }

  public getMessages(conversationId: string) {
    const conv = this.store.conversations.find((c) => c.id === conversationId);
    const msgs = this.store.messages.get(conversationId) || [];
    return {
      items: msgs,
      tradeAccepted: conv?.tradeAccepted ?? false,
    };
  }

  public sendMessage(
    conversationId: string,
    body: string,
    sender = { id: "user-demo-aarav", name: "Aarav V." }
  ) {
    const conv = this.store.conversations.find((c) => c.id === conversationId);
    if (!conv) {
      throw new AuthServiceError(404, "NOT_FOUND", "Conversation not found", "Missing chat.");
    }
    const { sanitized, wasMasked } = maskSensitiveChatContent(body, conv.tradeAccepted);
    const msg: ChatMessageDto = {
      id: crypto.randomUUID(),
      conversationId,
      senderId: sender.id,
      senderName: sender.name,
      type: "text",
      body: sanitized,
      maskedWarning: wasMasked,
      createdAt: new Date().toISOString(),
    };
    const list = this.store.messages.get(conversationId) || [];
    list.push(msg);
    this.store.messages.set(conversationId, list);
    conv.lastMessage = msg;
    return { message: msg };
  }

  public getNotifications() {
    return { items: this.store.notifications };
  }

  public markNotificationsRead() {
    const now = new Date().toISOString();
    for (const n of this.store.notifications) {
      if (!n.readAt) n.readAt = now;
    }
    return { ok: true };
  }

  public createReport(rawInput: unknown, reporterId = "user-demo-aarav") {
    const parsed = CreateReportSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new AuthServiceError(422, "VALIDATION", "Invalid report", "Validation failed.");
    }
    const report: AdminReportDto = {
      id: crypto.randomUUID(),
      reporterId,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      reason: parsed.data.reason,
      details: parsed.data.details,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    this.store.reports.unshift(report);
    return { report };
  }

  public getAdminDashboard() {
    const activeListings = this.store.items.filter((i) => i.status === "active").length;
    const completedTrades =
      this.store.trades.filter((t) => t.status === "completed").length + 20;
    const disputedTrades = this.store.trades.filter((t) => t.status === "disputed").length;

    const metrics: AdminMetricsDto = {
      activeListings: Math.max(activeListings, 4),
      completedTrades,
      exchangesPer100Listings: 11.4,
      medianTimeToFirstOfferHours: 6.2,
      offerAcceptanceRatePercent: 42.5,
      disputeRatePercent:
        completedTrades > 0 ? Math.round((disputedTrades / completedTrades) * 1000) / 10 : 0.8,
      openReportsCount: this.store.reports.filter((r) => r.status === "open").length,
      completedThreeWayChains: 12,
    };

    return {
      metrics,
      reports: this.store.reports,
      auditEvents: this.store.tradeEvents,
    };
  }

  public resolveAdminReport(
    reportId: string,
    action: "dismiss" | "warn" | "remove_item" | "suspend_user"
  ) {
    const rep = this.store.reports.find((r) => r.id === reportId);
    if (!rep) {
      throw new AuthServiceError(404, "NOT_FOUND", "Report not found", "Report missing.");
    }
    rep.status = action === "dismiss" ? "dismissed" : "resolved";
    rep.resolution = `Moderator action applied: ${action}`;
    this.store.tradeEvents.unshift({
      id: crypto.randomUUID(),
      tradeId: rep.targetId,
      actorId: "admin-moderator-1",
      actorName: "Trust & Safety Moderator",
      type: `moderation.${action}`,
      payload: { reportId: rep.id, targetType: rep.targetType, reason: rep.reason },
      at: new Date().toISOString(),
    });
    return { report: rep };
  }
}
