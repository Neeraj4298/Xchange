"use client";

import React, { useEffect, useState } from "react";
import type { InvoiceReceiptDto, PlanDto } from "@xchange/shared";
import { apiClient } from "@/lib/api-client";
import { useAppContext } from "@/components/providers/AppProviders";

export default function PlusAndVerificationPage() {
  const { pushToast } = useAppContext();
  const [plans, setPlans] = useState<PlanDto[]>([]);
  const [activePlan, setActivePlan] = useState<"free" | "xchange_plus">("free");
  const [invoices, setInvoices] = useState<InvoiceReceiptDto[]>([]);
  const [idBadge, setIdBadge] = useState<string>("");
  const [pushEnabled, setPushEnabled] = useState(false);

  const loadPlans = () => {
    apiClient
      .getBillingPlans()
      .then((res) => {
        setPlans(res.plans);
        setActivePlan(res.activePlanCode);
        setInvoices(res.invoices);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleSubscribe = async () => {
    const res = await apiClient.subscribePlusPlan();
    setActivePlan(res.activePlanCode);
    loadPlans();
    pushToast({
      title: "Upgraded to Xchange Plus (₹149/mo)!",
      description: `GST Invoice ${res.invoice.id} generated.`,
      tone: "success",
    });
  };

  const handleBoostListing = async () => {
    const res = await apiClient.promoteListing("01960000-0000-7000-8002-000000000003", 7);
    loadPlans();
    pushToast({
      title: "Featured Listing Boost Activated (7 Days)!",
      description: `Invoice ${res.invoice.id} issued.`,
      tone: "success",
    });
  };

  const handleVerifyId = async () => {
    const res = await apiClient.verifyGovernmentId("Aadhaar_DigiLocker");
    setIdBadge(res.badgeLabel);
    pushToast({
      title: "Government ID Verified! ✓",
      description: `Badge '${res.badgeLabel}' added to your profile.`,
      tone: "success",
    });
  };

  return (
    <div className="space-y-6">
      <div className="xc-glass-panel rounded-3xl p-6">
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
          WEB-4.4, WEB-4.5 &amp; WEB-4.6 · XCHANGE PLUS, ID VERIFICATION &amp; PWA LAUNCH
        </span>
        <h1 className="mt-2 text-2xl font-extrabold">
          Xchange Plus, Featured Boosts &amp; Trust Verification
        </h1>
        <p className="text-xs opacity-75">
          Principle 6.1: Core exchange is free forever. We monetise visibility, convenience, and trust.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {plans.map((pl) => (
          <div
            key={pl.id}
            className="xc-glass-panel rounded-3xl p-6 flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">{pl.name}</h2>
                <span className="font-mono text-lg font-extrabold text-emerald-400">
                  ₹{pl.priceInrMonthly}/mo
                </span>
              </div>
              <ul className="mt-3 space-y-1.5 text-xs opacity-85">
                {pl.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
            </div>

            {pl.code === "xchange_plus" ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSubscribe}
                  className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 py-2.5 text-xs font-bold text-slate-950"
                >
                  {activePlan === "xchange_plus"
                    ? "✓ Xchange Plus Active"
                    : "Upgrade to Plus (₹149/mo)"}
                </button>
                <button
                  type="button"
                  onClick={handleBoostListing}
                  className="rounded-xl border border-amber-400/50 bg-amber-500/15 px-3.5 py-2.5 text-xs font-bold text-amber-300"
                >
                  ⚡ Boost Listing (₹99)
                </button>
              </div>
            ) : (
              <span className="rounded-xl border border-emerald-500/30 py-2 text-center text-xs font-bold text-emerald-400">
                ✓ Included Forever for Every Trader
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="xc-glass-panel rounded-3xl p-6 space-y-3">
          <h2 className="text-lg font-bold">Optional Government ID Verification (WEB-4.4)</h2>
          <button
            type="button"
            onClick={handleVerifyId}
            className="rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950"
          >
            {idBadge ? `✓ ${idBadge}` : "Verify ID via DigiLocker →"}
          </button>
        </div>

        <div className="xc-glass-panel rounded-3xl p-6 space-y-3">
          <h2 className="text-lg font-bold">PWA Install &amp; Web Push Alerts (WEB-4.6)</h2>
          <button
            type="button"
            onClick={() => {
              setPushEnabled(true);
              pushToast({ title: "Web Push & PWA Shell Enabled!", tone: "success" });
            }}
            className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-2.5 text-xs font-bold text-emerald-300"
          >
            {pushEnabled ? "✓ Web Push Subscribed" : "🔔 Enable Web Push & PWA Shell"}
          </button>
        </div>
      </div>

      {invoices.length > 0 && (
        <div className="xc-glass-panel rounded-3xl p-6 space-y-2">
          <h2 className="text-lg font-bold">GST Invoices &amp; Receipts (WEB-4.5)</h2>
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="font-mono text-xs flex justify-between border-b border-emerald-500/15 py-2"
            >
              <span>
                {inv.id} · {inv.title}
              </span>
              <span className="text-emerald-400">
                ₹{inv.amountInr} + ₹{inv.gstInr} GST = ₹{inv.totalInr}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
