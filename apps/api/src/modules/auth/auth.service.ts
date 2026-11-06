import crypto from "node:crypto";
import { OtpRequestSchema, OtpVerifySchema, type VerificationLevel } from "@xchange/shared";
import { loadAppConfig, logger } from "../../config/env.config";
import { signHmacJwt, verifyHmacJwt } from "./jwt.util";

interface OtpRecord {
  codeHash: string;
  expiresAt: number;
  lastSentAt: number;
  attemptsInWindow: number;
  windowStartAt: number;
}

export interface UserProfileRecord {
  id: string;
  phoneE164: string;
  phoneMasked: string;
  name: string;
  neighbourhood: string;
  citySlug: string;
  verificationLevel: VerificationLevel;
  ratingAvg: number;
  tradesCompleted: number;
  joinedAt: string;
}

export class AuthServiceError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    public readonly title: string,
    message: string
  ) {
    super(message);
  }
}

export class AuthService {
  private readonly otpStore = new Map<string, OtpRecord>();
  private readonly userStore = new Map<string, UserProfileRecord>();
  private readonly config = loadAppConfig();

  private hashOtp(phoneE164: string, code: string): string {
    return crypto
      .createHmac("sha256", this.config.jwtAccessSecret)
      .update(`${phoneE164}:${code}`)
      .digest("hex");
  }

  public maskPhone(phoneE164: string): string {
    return `${phoneE164.slice(0, 5)}•••••${phoneE164.slice(-3)}`;
  }

  public requestOtp(rawInput: unknown) {
    const parsed = OtpRequestSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new AuthServiceError(
        422,
        "VALIDATION",
        "Invalid phone number format",
        parsed.error.issues[0]?.message || "Enter a valid +91 mobile number"
      );
    }

    const { phoneE164 } = parsed.data;
    const now = Date.now();
    const existing = this.otpStore.get(phoneE164);
    const oneHourMs = 3600 * 1000;
    let attemptsInWindow = 1;
    let windowStartAt = now;

    if (existing) {
      if (now - existing.windowStartAt < oneHourMs) {
        if (existing.attemptsInWindow >= this.config.otpMaxAttemptsPerHour) {
          throw new AuthServiceError(
            429,
            "RATE_LIMITED",
            "Too many OTP attempts",
            `Maximum ${this.config.otpMaxAttemptsPerHour} OTP requests allowed per hour.`
          );
        }
        attemptsInWindow = existing.attemptsInWindow + 1;
        windowStartAt = existing.windowStartAt;
      }

      const cooldownMs = this.config.otpResendCooldownSeconds * 1000;
      if (now - existing.lastSentAt < cooldownMs) {
        const waitSec = Math.ceil((cooldownMs - (now - existing.lastSentAt)) / 1000);
        throw new AuthServiceError(
          429,
          "RATE_LIMITED",
          "OTP resend cooldown active",
          `Please wait ${waitSec}s before requesting another OTP.`
        );
      }
    }

    const otpCode =
      this.config.nodeEnv === "production"
        ? String(crypto.randomInt(100000, 999999))
        : "424242";

    this.otpStore.set(phoneE164, {
      codeHash: this.hashOtp(phoneE164, otpCode),
      expiresAt: now + this.config.otpTtlSeconds * 1000,
      lastSentAt: now,
      attemptsInWindow,
      windowStartAt,
    });

    logger.info("OTP requested", { phoneE164, requestCount: attemptsInWindow });

    return {
      requestId: crypto.randomUUID(),
      phoneMasked: this.maskPhone(phoneE164),
      expiresInSeconds: this.config.otpTtlSeconds,
      resendAfterSeconds: this.config.otpResendCooldownSeconds,
      ...(this.config.nodeEnv !== "production" ? { devOtpPreview: otpCode } : {}),
    };
  }

  public verifyOtp(rawInput: unknown) {
    const parsed = OtpVerifySchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new AuthServiceError(
        422,
        "VALIDATION",
        "Invalid OTP verification payload",
        parsed.error.issues[0]?.message || "Invalid input"
      );
    }

    const { phoneE164, otpCode } = parsed.data;
    const record = this.otpStore.get(phoneE164);

    if (!record || Date.now() > record.expiresAt) {
      throw new AuthServiceError(
        401,
        "OTP_EXPIRED",
        "OTP expired or not found",
        "Your OTP has expired (5-minute limit). Please request a new code."
      );
    }

    if (record.codeHash !== this.hashOtp(phoneE164, otpCode)) {
      throw new AuthServiceError(
        401,
        "OTP_INVALID",
        "Incorrect OTP code",
        "The 6-digit verification code entered does not match."
      );
    }

    this.otpStore.delete(phoneE164);

    let user = this.userStore.get(phoneE164);
    if (!user) {
      user = {
        id: crypto.randomUUID(),
        phoneE164,
        phoneMasked: this.maskPhone(phoneE164),
        name: "Aarav Verma (Beta Trader)",
        neighbourhood: "HSR Layout Sector 2",
        citySlug: "bengaluru",
        verificationLevel: "phone",
        ratingAvg: 4.92,
        tradesCompleted: 6,
        joinedAt: new Date().toISOString(),
      };
      this.userStore.set(phoneE164, user);
    }

    const accessToken = signHmacJwt(
      {
        sub: user.id,
        phoneE164: user.phoneE164,
        exp: Math.floor(Date.now() / 1000) + this.config.jwtAccessTtlSeconds,
      },
      this.config.jwtAccessSecret
    );

    const { phoneE164: _hidden, ...publicUser } = user;
    return {
      accessToken,
      expiresInSeconds: this.config.jwtAccessTtlSeconds,
      user: publicUser,
    };
  }

  public getAuthenticatedUser(authHeader?: string) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AuthServiceError(401, "UNAUTHORIZED", "Missing Bearer token", "Missing JWT.");
    }
    const token = authHeader.slice("Bearer ".length).trim();
    const payload = verifyHmacJwt(token, this.config.jwtAccessSecret);
    if (!payload) {
      throw new AuthServiceError(401, "UNAUTHORIZED", "Invalid token", "Invalid or expired JWT.");
    }
    const user = this.userStore.get(payload.phoneE164);
    if (!user) {
      throw new AuthServiceError(401, "UNAUTHORIZED", "Session not found", "User not found.");
    }
    const { phoneE164: _hidden, ...publicUser } = user;
    return { user: publicUser };
  }

  public googleSignIn(rawInput: { email?: string; name?: string }) {
    const phoneKey = "+919876543210";
    let user = this.userStore.get(phoneKey);
    if (!user) {
      user = {
        id: "user-demo-aarav",
        phoneE164: phoneKey,
        phoneMasked: this.maskPhone(phoneKey),
        name: rawInput.name || "Aarav Verma (Google Verified)",
        neighbourhood: "HSR Layout Sector 2",
        citySlug: "bengaluru",
        verificationLevel: "phone",
        ratingAvg: 4.92,
        tradesCompleted: 6,
        joinedAt: new Date().toISOString(),
      };
      this.userStore.set(phoneKey, user);
    }
    const accessToken = signHmacJwt(
      {
        sub: user.id,
        phoneE164: user.phoneE164,
        exp: Math.floor(Date.now() / 1000) + this.config.jwtAccessTtlSeconds,
      },
      this.config.jwtAccessSecret
    );
    const { phoneE164: _hidden, ...publicUser } = user;
    return {
      accessToken,
      expiresInSeconds: this.config.jwtAccessTtlSeconds,
      user: publicUser,
    };
  }

  public updateProfile(rawInput: { name?: string; neighbourhood?: string }) {
    const phoneKey = "+919876543210";
    let user = this.userStore.get(phoneKey);
    if (!user) {
      user = {
        id: "user-demo-aarav",
        phoneE164: phoneKey,
        phoneMasked: this.maskPhone(phoneKey),
        name: "Aarav Verma",
        neighbourhood: "HSR Layout Sector 2",
        citySlug: "bengaluru",
        verificationLevel: "phone",
        ratingAvg: 4.92,
        tradesCompleted: 6,
        joinedAt: new Date().toISOString(),
      };
    }
    if (rawInput.name) user.name = rawInput.name;
    if (rawInput.neighbourhood) user.neighbourhood = rawInput.neighbourhood;
    this.userStore.set(phoneKey, user);
    const { phoneE164: _hidden, ...publicUser } = user;
    return { user: publicUser };
  }
}
