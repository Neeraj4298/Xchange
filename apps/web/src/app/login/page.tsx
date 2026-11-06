"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { emitAnalyticsEvent } from "@/lib/observability";
import { useAppContext } from "@/components/providers/AppProviders";

const INTEREST_OPTIONS = [
  "Electronics",
  "Fashion",
  "Home and Furniture",
  "Books",
  "Sports and Fitness",
  "Appliances",
  "Collectibles",
];

export default function AuthAndOnboardingPage() {
  const router = useRouter();
  const { setSession, pushToast } = useAppContext();

  const [authMode, setAuthMode] = useState<"signin" | "register">("register");
  const [step, setStep] = useState<"phone" | "otp" | "profile">("phone");

  const [countryCode, setCountryCode] = useState("+91");
  const [phoneDigits, setPhoneDigits] = useState("9876543210");
  const [consentChecked, setConsentChecked] = useState(true);

  const [otpCode, setOtpCode] = useState("424242");
  const [otpStatus, setOtpStatus] = useState<
    "idle" | "sending" | "sent" | "invalid" | "expired" | "rate_limited" | "verified"
  >("idle");

  // Screen 4 — Profile Setup Fields for New Users
  const [displayName, setDisplayName] = useState("Aarav Verma");
  const [username, setUsername] = useState("aarav_blr");
  const [accountType, setAccountType] = useState<"individual" | "business">("individual");
  const [businessName, setBusinessName] = useState("");
  const [businessCategory, setBusinessCategory] = useState("Electronics & Refurbished Gear");
  const [locality, setLocality] = useState("Indiranagar, Bengaluru");
  const [bio, setBio] = useState("Product designer & photography enthusiast trading cameras and studio gear.");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Electronics",
    "Books",
  ]);

  const fullPhoneE164 = `${countryCode}${phoneDigits.replace(/\D/g, "")}`;

  const handleContinuePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentChecked) {
      pushToast({
        title: "Terms & Privacy consent required",
        description: "Please agree to the Terms and Privacy Policy to continue.",
        tone: "warning",
      });
      return;
    }
    setOtpStatus("sending");
    try {
      await apiClient.requestOtp({ phoneE164: fullPhoneE164 });
      setOtpStatus("sent");
      setStep("otp");
      pushToast({
        title: "Verification code sent",
        description: `6-digit OTP sent to ${countryCode} ••••••${phoneDigits.slice(-4)} (Code: 424242)`,
      });
    } catch {
      // Fallback for offline/demo mode
      setOtpStatus("sent");
      setStep("otp");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setOtpStatus("invalid");
      return;
    }
    try {
      const res = await apiClient.verifyOtp({
        phoneE164: fullPhoneE164,
        otpCode,
        deviceId: "xchange-pure-web",
      });
      setSession(res.accessToken, res.user);
      setOtpStatus("verified");
      if (authMode === "register") {
        setStep("profile");
      } else {
        emitAnalyticsEvent("signup_completed", { mode: "signin" });
        router.push("/app");
      }
    } catch {
      if (otpCode === "424242") {
        setOtpStatus("verified");
        if (authMode === "register") setStep("profile");
        else router.push("/app");
      } else {
        setOtpStatus("invalid");
      }
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await apiClient.updateProfile({
        name: displayName,
        neighbourhood: locality,
        bio,
      });
      setSession("demo-token", updated.user);
    } catch {
      // fallback
    }
    emitAnalyticsEvent("signup_completed", { accountType, locality });
    pushToast({
      title: "Welcome to Xchange",
      description: `Profile @${username} completed.`,
      tone: "success",
    });
    router.push("/app");
  };

  return (
    <div className="mx-auto max-w-md py-6">
      <div className="xc-glass-panel p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--brand-primary)] text-white font-heading font-bold text-sm">
              X
            </div>
            <span className="font-heading text-base font-bold tracking-tight">XCHANGE</span>
          </div>

          <div className="flex rounded-full bg-[var(--surface)] border border-[var(--border)] p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setAuthMode("signin");
                setStep("phone");
              }}
              className={`rounded-full px-3 py-1 ${
                authMode === "signin"
                  ? "bg-[var(--brand-primary)] text-white font-semibold"
                  : "text-[var(--muted)]"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("register");
                setStep("phone");
              }}
              className={`rounded-full px-3 py-1 ${
                authMode === "register"
                  ? "bg-[var(--brand-primary)] text-white font-semibold"
                  : "text-[var(--muted)]"
              }`}
            >
              Create account
            </button>
          </div>
        </div>

        {step === "phone" && (
          <form onSubmit={handleContinuePhone} className="space-y-4">
            <div>
              <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">
                {authMode === "register" ? "Welcome to Xchange" : "Sign in to Xchange"}
              </h1>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {authMode === "register"
                  ? "Create your account with your mobile number to list items and propose exchanges."
                  : "Enter your registered mobile number to receive a six-digit verification code."}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium">Phone number</label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  aria-label="Country code"
                  className="w-24 rounded-[8px] border border-[var(--border)] px-3 py-2.5 text-sm font-medium"
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                </select>
                <input
                  type="tel"
                  value={phoneDigits}
                  onChange={(e) => setPhoneDigits(e.target.value)}
                  placeholder="98765 43210"
                  required
                  className="flex-1 rounded-[8px] border border-[var(--border)] px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 text-xs text-[var(--muted)]">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-0.5 accent-[#7167E8]"
              />
              <span>
                I agree to the{" "}
                <a href="/trust" className="font-medium text-[var(--brand-primary)] hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/trust" className="font-medium text-[var(--brand-primary)] hover:underline">
                  Privacy Policy
                </a>
                .
              </span>
            </label>

            <button type="submit" className="xc-btn-primary w-full py-3 text-sm">
              {otpStatus === "sending" ? "Sending OTP..." : "Continue"}
            </button>

            <p className="text-center text-xs text-[var(--muted)]">
              {authMode === "register" ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthMode("signin")}
                    className="font-semibold text-[var(--brand-primary)] hover:underline"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  New to Xchange?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthMode("register")}
                    className="font-semibold text-[var(--brand-primary)] hover:underline"
                  >
                    Create an account
                  </button>
                </>
              )}
            </p>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">
                Verify your number
              </h1>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Enter the six-digit code sent to{" "}
                <strong className="text-[var(--foreground)]">
                  {countryCode} ••••••{phoneDigits.slice(-4)}
                </strong>
                .
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium">
                Six-digit verification code (Demo code: 424242)
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full rounded-[8px] border border-[var(--border)] px-4 py-3 text-center font-mono text-lg tracking-[0.4em]"
              />
            </div>

            {otpStatus === "invalid" && (
              <p className="text-xs font-medium" style={{ color: "var(--danger)" }}>
                Invalid verification code. Please check the six-digit code and try again.
              </p>
            )}

            <button type="submit" className="xc-btn-primary w-full py-3 text-sm">
              {authMode === "register" ? "Verify & Set Up Profile" : "Verify & Sign In"}
            </button>

            <div className="flex items-center justify-between text-xs text-[var(--muted)]">
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="font-medium text-[var(--brand-primary)] hover:underline"
              >
                Change phone number
              </button>
              <span>Resend OTP in 28s</span>
            </div>
          </form>
        )}
        {step === "profile" && (
          <form onSubmit={handleCompleteProfile} className="space-y-4">
            <div>
              <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">
                Set up your profile
              </h1>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Tell nearby members who you are and what you like to exchange.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block text-xs font-medium">
                Full display name
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="mt-1 w-full rounded-[8px] border border-[var(--border)] px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-medium">
                Username
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="mt-1 w-full rounded-[8px] border border-[var(--border)] px-3 py-2 text-sm"
                />
              </label>
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-medium">Account type</span>
              <div className="grid grid-cols-2 gap-2">
                {(["individual", "business"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAccountType(type)}
                    className={`rounded-[8px] border py-2 text-xs font-semibold capitalize ${
                      accountType === type
                        ? "border-[var(--brand-primary)] bg-[var(--brand-tint)] text-[var(--brand-primary)]"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {accountType === "business" && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-3">
                <label className="block text-xs font-medium">
                  Business name
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Bengaluru Studio Gear Co."
                    className="mt-1 w-full rounded-[8px] border border-[var(--border)] px-3 py-2 text-xs"
                  />
                </label>
                <label className="block text-xs font-medium">
                  Business category
                  <input
                    type="text"
                    value={businessCategory}
                    onChange={(e) => setBusinessCategory(e.target.value)}
                    className="mt-1 w-full rounded-[8px] border border-[var(--border)] px-3 py-2 text-xs"
                  />
                </label>
              </div>
            )}

            <label className="block text-xs font-medium">
              City and locality
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="mt-1 w-full rounded-[8px] border border-[var(--border)] px-3 py-2 text-sm"
              />
            </label>

            <label className="block text-xs font-medium">
              Short bio
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-1 w-full rounded-[8px] border border-[var(--border)] px-3 py-2 text-sm"
              />
            </label>

            <div className="space-y-1.5">
              <span className="block text-xs font-medium">Optional interests</span>
              <div className="flex flex-wrap gap-1.5">
                {INTEREST_OPTIONS.map((interest) => {
                  const selected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() =>
                        setSelectedInterests((prev) =>
                          prev.includes(interest)
                            ? prev.filter((i) => i !== interest)
                            : [...prev, interest]
                        )
                      }
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        selected
                          ? "bg-[var(--brand-primary)] text-white"
                          : "border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="submit" className="xc-btn-primary w-full py-3 text-sm">
              Complete profile
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

