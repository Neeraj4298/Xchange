"use client";

import React, { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { emitAnalyticsEvent } from "@/lib/observability";
import { useAppContext } from "@/components/providers/AppProviders";

export default function LoginPage() {
  const { user, setSession, pushToast } = useAppContext();
  const [phone, setPhone] = useState("+919876543210");
  const [otpCode, setOtpCode] = useState("424242");
  const [step, setStep] = useState<"phone" | "otp" | "verified">("phone");
  const [devOtpHint, setDevOtpHint] = useState<string>("424242");
  const [protectedCheck, setProtectedCheck] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.requestOtp({ phoneE164: phone });
      if (res.devOtpPreview) setDevOtpHint(res.devOtpPreview);
      setStep("otp");
      pushToast({
        title: `OTP Dispatched to ${res.phoneMasked}`,
        description: `Expires in ${res.expiresInSeconds}s · Dev OTP: ${res.devOtpPreview || "424242"}`,
        tone: "success",
      });
    } catch (err) {
      pushToast({
        title: "OTP Request Note",
        description: err instanceof Error ? err.message : "Failed to request OTP",
        tone: "warning",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.verifyOtp({
        phoneE164: phone,
        otpCode,
        deviceId: "nextjs-web-phase0",
      });
      setSession(res.accessToken, res.user);
      const meCheck = await apiClient.getMe(res.accessToken);
      setProtectedCheck(
        `GET /v1/me 200 OK · Verified ${meCheck.user.name} (${meCheck.user.phoneMasked})`
      );
      setStep("verified");
      emitAnalyticsEvent("signup_completed", { city: meCheck.user.citySlug });
      pushToast({
        title: "Phase 0 Exit Gate Passed!",
        description: "Signed in via Phone OTP and verified protected /v1/me endpoint.",
        tone: "success",
      });
    } catch (err) {
      pushToast({
        title: "OTP Verification Error",
        description: err instanceof Error ? err.message : "Invalid OTP",
        tone: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="xc-glass-panel rounded-3xl p-6 md:p-8 shadow-2xl">
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
          PHASE 0 EXIT GATE · P0-T5 &amp; FR-AUTH-1
        </span>
        <h1 className="mt-3 text-2xl font-extrabold">
          Phone OTP Sign-In &amp; Protected Endpoint Verification
        </h1>
        <p className="mt-1 text-sm opacity-75">
          5-minute OTP TTL · Max 5 attempts/hr · 30s resend cooldown · JWT Bearer guard on{" "}
          <code className="text-emerald-400">GET /v1/me</code>.
        </p>

        {step === "phone" && (
          <form onSubmit={handleRequestOtp} className="mt-6 space-y-4">
            <label className="block text-xs font-semibold uppercase tracking-wider">
              Indian Mobile Number (E.164)
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-emerald-500/30 bg-slate-950/60 px-4 py-3 font-mono text-sm"
                placeholder="+919876543210"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 py-3 text-sm font-bold text-slate-950"
            >
              {loading ? "Requesting OTP..." : "Send 6-Digit OTP via POST /v1/auth/otp/request →"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
            <label className="block text-xs font-semibold uppercase tracking-wider">
              Enter 6-Digit OTP (Dev code: {devOtpHint})
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-emerald-500/30 bg-slate-950/60 px-4 py-3 font-mono text-lg tracking-widest"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 py-3 text-sm font-bold text-slate-950"
            >
              {loading ? "Verifying..." : "Verify OTP & Call Protected GET /v1/me →"}
            </button>
          </form>
        )}

        {(step === "verified" || user) && (
          <div className="mt-6 space-y-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4">
            <p className="text-xs font-bold uppercase text-emerald-400">
              ✓ Authenticated Trader Session Active
            </p>
            <p className="font-mono text-xs">{protectedCheck}</p>
            {user && (
              <div className="text-xs space-y-1 opacity-90">
                <p>Trader: {user.name}</p>
                <p>Cluster: {user.neighbourhood} ({user.citySlug})</p>
                <p>Reputation: ★ {user.ratingAvg} ({user.tradesCompleted} completed swaps)</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
