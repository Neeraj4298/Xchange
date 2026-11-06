/**
 * Platform Limits, Prohibited-Item Checks, Privacy Rounding & Matching Score
 */

export const PLATFORM_LIMITS = {
  OTP_EXPIRY_SECONDS: 300,
  OTP_MAX_ATTEMPTS_PER_HOUR: 5,
  OTP_RESEND_COOLDOWN_SECONDS: 30,
  OFFER_DEFAULT_EXPIRY_HOURS: 72,
  CHAIN_ACCEPTANCE_WINDOW_HOURS: 24,
  DEFAULT_MAX_CASH_IMBALANCE_PAISE: 500_000,
  DEFAULT_CHAIN_MEETUP_RADIUS_M: 8_000,
  LISTING_EXPIRY_DAYS: 60,
  LISTING_MAX_PHOTOS: 8,
  NEW_USER_MAX_ACTIVE_LISTINGS: 3,
  NEW_USER_MAX_SIMULTANEOUS_TRADES: 2,
  DISPUTE_WINDOW_HOURS: 48,
} as const;

export const PROHIBITED_KEYWORDS = [
  "gun",
  "firearm",
  "pistol",
  "rifle",
  "ammunition",
  "explosive",
  "weed",
  "cannabis",
  "cocaine",
  "narcotic",
  "prescription medicine",
  "steroid",
  "whiskey",
  "vodka",
  "cigarette",
  "vape",
  "first copy",
  "counterfeit",
  "stolen",
  "live puppy",
  "live kitten",
] as const;

export const RESTRICTED_CATEGORY_SLUGS = [
  "vehicles-motor",
  "real-estate",
  "weapons",
  "pharmaceuticals",
] as const;

export interface ProhibitedCheckResult {
  allowed: boolean;
  matchedKeywords: string[];
  reason?: string;
}

export function checkProhibitedContent(text: string, categorySlug?: string): ProhibitedCheckResult {
  if (categorySlug && (RESTRICTED_CATEGORY_SLUGS as readonly string[]).includes(categorySlug)) {
    return {
      allowed: false,
      matchedKeywords: [],
      reason: `Category '${categorySlug}' is restricted under Xchange Trust & Safety policy (FR-LST-4).`,
    };
  }
  const normalized = text.toLowerCase();
  const matched = PROHIBITED_KEYWORDS.filter((kw) => {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`, "i").test(normalized);
  });
  if (matched.length > 0) {
    return {
      allowed: false,
      matchedKeywords: matched,
      reason: `Prohibited item keyword(s) detected: ${matched.join(", ")}`,
    };
  }
  return { allowed: true, matchedKeywords: [] };
}

export function snapToOneKmGrid(lat: number, lng: number): { lat: number; lng: number } {
  const step = 0.01;
  return {
    lat: Math.round(lat / step) * step,
    lng: Math.round(lng / step) * step,
  };
}

export function formatInrFromPaise(paise: number): string {
  const rupees = Math.round(paise / 100);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

export interface MatchFactors {
  itemPreference: number;
  valueCompatibility: number;
  locationProximity: number;
  conditionCompatibility: number;
  userPreferences: number;
}

export function computeMatchScore(factors: MatchFactors): number {
  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  const score =
    0.3 * clamp(factors.itemPreference) +
    0.25 * clamp(factors.valueCompatibility) +
    0.2 * clamp(factors.locationProximity) +
    0.15 * clamp(factors.conditionCompatibility) +
    0.1 * clamp(factors.userPreferences);
  return Math.round(score * 100) / 100;
}
