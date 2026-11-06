import { z } from "zod";
import type { CityDto } from "./schemas";

export type SupportedLocale = "en-IN" | "kn-IN" | "hi-IN";

export const I18N_DICTIONARY: Record<
  SupportedLocale,
  {
    languageLabel: string;
    tagline: string;
    subtitle: string;
    ctaButton: string;
    notificationSample: string;
  }
> = {
  "en-IN": {
    languageLabel: "English (India)",
    tagline: "Own less. Exchange more.",
    subtitle: "Make exchanging possessions as easy as buying online across Bengaluru & Hyderabad.",
    ctaButton: "Explore 4-Way Cycles & Multi-City Swaps",
    notificationSample: "⚡ 4-Way Chain Ready! Your item completes a 4-party swap at Indiranagar Metro.",
  },
  "kn-IN": {
    languageLabel: "ಕನ್ನಡ (Kannada)",
    tagline: "ಕಡಿಮೆ ಹೊಂದಿರಿ. ಹೆಚ್ಚು ವಿನಿಮಯ ಮಾಡಿಕೊಳ್ಳಿ.",
    subtitle: "ಬೆಂಗಳೂರು ಮತ್ತು ಹೈದರಾಬಾದ್‌ನಲ್ಲಿ ನಿಮ್ಮ ವಸ್ತುಗಳನ್ನು ಸುಲಭವಾಗಿ ವಿನಿಮಯ ಮಾಡಿಕೊಳ್ಳಿ.",
    ctaButton: "4-ಹಂತದ ವಿನಿಮಯ ಸರಪಳಿಯನ್ನು ವೀಕ್ಷಿಸಿ",
    notificationSample: "⚡ 4-ವ್ಯಕ್ತಿಗಳ ವಿನಿಮಯ ಸಿದ್ಧವಾಗಿದೆ! ಇಂದಿರಾನಗರ ಮೆಟ್ರೋ ಸುರಕ್ಷಿತ ಕೇಂದ್ರದಲ್ಲಿ ಭೇಟಿಯಾಗಿ.",
  },
  "hi-IN": {
    languageLabel: "हिन्दी (Hindi)",
    tagline: "कम रखें। अधिक विनिमय करें।",
    subtitle: "बेंगलुरु और हैदराबाद में अपनी वस्तुओं को ऑनलाइन खरीदारी की तरह आसानी से एक्सचेंज करें।",
    ctaButton: "4-तरफा एक्सचेंज चेन देखें",
    notificationSample: "⚡ 4-पार्टी एक्सचेंज चेन तैयार है! इंदिरानगर मेट्रो सेफ पॉइंट पर हैंडओवर की पुष्टि करें।",
  },
};

export interface FourWayChainNodeDto {
  code: "A" | "B" | "C" | "D";
  traderName: string;
  trustScoreV2: number;
  neighbourhood: string;
  givesTitle: string;
  receivesFromCode: "A" | "B" | "C" | "D";
  handoverStep: 1 | 2 | 3 | 4;
  handoverCode: string;
  confirmed: boolean;
}

export interface FourWayChainDto {
  id: string;
  city: string;
  status: "proposed" | "accepted" | "partially_confirmed" | "completed";
  minEdgeScore: number;
  meetupHub: string;
  nodes: FourWayChainNodeDto[];
}

export interface DeliveryPartnerQuoteDto {
  partnerName: string;
  distanceKm: number;
  estimatedPartnerFeeInr: number;
  platformReferralCommissionInr: number;
  etaMinutes: number;
}

export const BulkUploadListingSchema = z.object({
  businessName: z.string().min(2).max(100).default("Bengaluru Circular Tech Refurbishers"),
  gstin: z.string().min(5).max(20).default("29AAACX4298F1Z5"),
  items: z
    .array(
      z.object({
        title: z.string().min(3),
        categorySlug: z.string().default("workstation-audio"),
        estValueInr: z.number().min(500),
        wantsKeyword: z.string().default("Used Laptops / Monitors"),
      })
    )
    .min(1)
    .max(25),
});
export type BulkUploadListingInput = z.infer<typeof BulkUploadListingSchema>;

export interface TunedMatchingWeightsDto {
  itemPreferenceWeight: number;
  valueCompatibilityWeight: number;
  locationProximityWeight: number;
  conditionCompatibilityWeight: number;
  userPreferencesWeight: number;
  trainingSamplesCount: number;
  lastTunedAt: string;
}

export function tuneMatchingWeights(acceptedCount = 48, rejectedCount = 32): TunedMatchingWeightsDto {
  const total = Math.max(1, acceptedCount + rejectedCount);
  const acceptRatio = acceptedCount / total;
  const iW = Math.round((0.30 + (acceptRatio - 0.5) * 0.08) * 100) / 100;
  const vW = Math.round((0.25 + (0.5 - acceptRatio) * 0.06) * 100) / 100;
  const lW = 0.21;
  const cW = 0.14;
  const pW = Math.round((1 - (iW + vW + lW + cW)) * 100) / 100;

  return {
    itemPreferenceWeight: iW,
    valueCompatibilityWeight: vW,
    locationProximityWeight: lW,
    conditionCompatibilityWeight: cW,
    userPreferencesWeight: pW,
    trainingSamplesCount: total,
    lastTunedAt: new Date().toISOString(),
  };
}

export interface ScaleOverviewResponse {
  locales: SupportedLocale[];
  cities: CityDto[];
  fourWayChain: FourWayChainDto;
  tunedWeights: TunedMatchingWeightsDto;
  businessListingsCreated: number;
}
