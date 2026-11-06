"use client";

import React, { useEffect, useState } from "react";
import type { AdminMetricsDto, AdminReportDto, TradeEventDto } from "@xchange/shared";
import { apiClient } from "@/lib/api-client";
import { useAppContext } from "@/components/providers/AppProviders";

export default function AdminConsolePage() {
  const { pushToast } = useAppContext();
  const [metrics, setMetrics] = useState<AdminMetricsDto | null>(null);
  const [reports, setReports] = useState<AdminReportDto[]>([]);
  const [auditEvents, setAuditEvents] = useState<TradeEventDto[]>([]);

  const loadDashboard = () => {
    apiClient
      .getAdminDashboard()
      .then((res) => {
        setMetrics(res.metrics);
        setReports(res.reports);
        setAuditEvents(res.auditEvents);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleResolve = async (
    reportId: string,
    action: "dismiss" | "warn" | "remove_item" | "suspend_user"
  ) => {
    await apiClient.resolveAdminReport(reportId, action);
    loadDashboard();
    pushToast({
      title: `Moderation Action Applied: ${action}`,
      description: "Immutable entry written to moderation audit log.",
      tone: "info",
    });
  };

  return (
    <div className="space-y-6">
      <div className="xc-glass-panel rounded-3xl p-6">
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
          WEB-1.14 &amp; BE-1.11 · INTERNAL ADMIN CONSOLE &amp; NORTH-STAR TELEMETRY
        </span>
        <h1 className="mt-2 text-2xl font-extrabold">
          Xchange Operations, Moderation &amp; Audit Console
        </h1>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="xc-glass-panel rounded-2xl p-4">
            <p className="text-xs opacity-70">North Star: Exchanges / 100 Listings</p>
            <p className="mt-1 text-2xl font-extrabold text-emerald-400">
              {metrics.exchangesPer100Listings}
            </p>
          </div>
          <div className="xc-glass-panel rounded-2xl p-4">
            <p className="text-xs opacity-70">Completed Trades (Beta Gate ≥ 20)</p>
            <p className="mt-1 text-2xl font-extrabold text-emerald-400">
              {metrics.completedTrades}
            </p>
          </div>
          <div className="xc-glass-panel rounded-2xl p-4">
            <p className="text-xs opacity-70">Dispute Rate (Target &lt; 3%)</p>
            <p className="mt-1 text-2xl font-extrabold text-emerald-400">
              {metrics.disputeRatePercent}%
            </p>
          </div>
          <div className="xc-glass-panel rounded-2xl p-4">
            <p className="text-xs opacity-70">Open Moderation Reports</p>
            <p className="mt-1 text-2xl font-extrabold text-amber-400">
              {metrics.openReportsCount}
            </p>
          </div>
        </div>
      )}

      <div className="xc-glass-panel rounded-3xl p-6 space-y-4">
        <h2 className="text-lg font-bold">Moderation Reports Queue (FR-MOD-2)</h2>
        {reports.map((r) => (
          <div
            key={r.id}
            className="rounded-2xl border border-emerald-500/25 p-4 flex flex-wrap items-center justify-between gap-3 text-xs"
          >
            <div>
              <p className="font-bold text-emerald-400">
                [{r.status.toUpperCase()}] {r.targetType.toUpperCase()} · {r.reason}
              </p>
              <p className="mt-1 opacity-80">{r.details}</p>
              {r.resolution && <p className="mt-1 text-amber-300">{r.resolution}</p>}
            </div>

            {r.status === "open" && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleResolve(r.id, "warn")}
                  className="rounded-xl border border-amber-400/50 px-3 py-1.5 text-amber-300"
                >
                  Strike 1: Warn
                </button>
                <button
                  type="button"
                  onClick={() => handleResolve(r.id, "remove_item")}
                  className="rounded-xl border border-red-400/50 px-3 py-1.5 text-red-300"
                >
                  Remove Content
                </button>
                <button
                  type="button"
                  onClick={() => handleResolve(r.id, "dismiss")}
                  className="rounded-xl border border-emerald-500/30 px-3 py-1.5"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="xc-glass-panel rounded-3xl p-6 space-y-2">
        <h2 className="text-lg font-bold">Immutable Audit Log (trade_events + moderation_actions)</h2>
        <div className="font-mono text-xs space-y-1 opacity-85">
          {auditEvents.length === 0 ? (
            <p>No audit transitions recorded in this session yet.</p>
          ) : (
            auditEvents.map((ev) => (
              <p key={ev.id}>
                {new Date(ev.at).toISOString()} · <strong>{ev.type}</strong> · Actor: {ev.actorName}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
