/**
 * Environment Configuration, Feature Flags & Redacted Structured Logger (BE-0.2 / P0-T5)
 * Rule 7 (.clinerules): Never log PII (phone numbers, emails) or raw tokens/OTPs.
 */

export interface AppConfig {
  nodeEnv: string;
  port: number;
  host: string;
  corsOrigin: string;
  jwtAccessSecret: string;
  jwtAccessTtlSeconds: number;
  otpTtlSeconds: number;
  otpMaxAttemptsPerHour: number;
  otpResendCooldownSeconds: number;
}

export function loadAppConfig(): AppConfig {
  return {
    nodeEnv: process.env.NODE_ENV || "development",
    port: Number(process.env.API_PORT || 4000),
    host: process.env.API_HOST || "0.0.0.0",
    corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
    jwtAccessSecret:
      process.env.JWT_ACCESS_SECRET ||
      "dev-only-jwt-access-secret-replace-in-production-32chars",
    jwtAccessTtlSeconds: Number(process.env.JWT_ACCESS_TTL_SECONDS || 900),
    otpTtlSeconds: Number(process.env.OTP_TTL_SECONDS || 300),
    otpMaxAttemptsPerHour: Number(process.env.OTP_MAX_ATTEMPTS_PER_HOUR || 5),
    otpResendCooldownSeconds: Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 30),
  };
}

const REDACTED_KEYS = new Set([
  "phone",
  "phoneE164",
  "email",
  "otpCode",
  "accessToken",
  "refreshToken",
  "authorization",
]);

function redactObject(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(meta)) {
    if (REDACTED_KEYS.has(key)) {
      sanitized[key] = "[REDACTED_PII]";
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

export const logger = {
  info(msg: string, meta?: Record<string, unknown>): void {
    const entry = {
      level: "info",
      time: new Date().toISOString(),
      service: "xchange-api",
      msg,
      ...(redactObject(meta) ?? {}),
    };
    if (process.env.NODE_ENV !== "test") {
      console.log(JSON.stringify(entry));
    }
  },
  warn(msg: string, meta?: Record<string, unknown>): void {
    const entry = {
      level: "warn",
      time: new Date().toISOString(),
      service: "xchange-api",
      msg,
      ...(redactObject(meta) ?? {}),
    };
    if (process.env.NODE_ENV !== "test") {
      console.warn(JSON.stringify(entry));
    }
  },
  error(msg: string, meta?: Record<string, unknown>): void {
    const entry = {
      level: "error",
      time: new Date().toISOString(),
      service: "xchange-api",
      msg,
      ...(redactObject(meta) ?? {}),
    };
    if (process.env.NODE_ENV !== "test") {
      console.error(JSON.stringify(entry));
    }
  },
};
