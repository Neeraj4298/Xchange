import { z } from "zod";
import { CASH_DIRECTIONS, type ItemCondition, type VerificationLevel } from "./enums";

export const OtpRequestSchema = z.object({
  phoneE164: z
    .string()
    .regex(/^\+91[6-9]\d{9}$/, "Enter a valid Indian mobile number starting with +91"),
});
export type OtpRequestInput = z.infer<typeof OtpRequestSchema>;

export const OtpVerifySchema = z.object({
  phoneE164: z
    .string()
    .regex(/^\+91[6-9]\d{9}$/, "Enter a valid Indian mobile number starting with +91"),
  otpCode: z.string().regex(/^\d{6}$/, "OTP must be a 6-digit code"),
  deviceId: z.string().min(1).default("web-browser"),
});
export type OtpVerifyInput = z.infer<typeof OtpVerifySchema>;

export const CreateOfferSchema = z.object({
  recipientItemId: z.string().uuid(),
  offeredItemIds: z.array(z.string().uuid()).min(1).max(5),
  cash: z
    .object({
      amountPaise: z.number().int().min(0).max(5_000_000),
      direction: z.enum(CASH_DIRECTIONS),
    })
    .default({ amountPaise: 0, direction: "none" }),
  message: z.string().max(500).optional(),
});
export type CreateOfferInput = z.infer<typeof CreateOfferSchema>;

export interface CityDto {
  id: string;
  name: string;
  slug: string;
  enabled: boolean;
  neighbourhoods: string[];
  activeListingsCount: number;
  completedChainsCount: number;
}

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  icon: string;
  restricted: boolean;
  itemCount: number;
}

export interface FeaturedItemDto {
  id: string;
  title: string;
  categorySlug: string;
  categoryName: string;
  condition: ItemCondition;
  estValueMinPaise: number;
  estValueMaxPaise: number;
  valueConfidence: number;
  neighbourhood: string;
  distanceKm: number;
  ownerName: string;
  ownerRating: number;
  ownerVerified: VerificationLevel;
  wantsSummary: string[];
  openToCash: boolean;
  matchScore: number;
  imageGradient: string;
  badge?: string;
}

export interface ChainCycleNodeDto {
  participantCode: "A" | "B" | "C";
  userName: string;
  neighbourhood: string;
  rating: number;
  givesItemTitle: string;
  givesItemCategory: string;
  givesValueRangeInr: string;
  wantsDescription: string;
  receivesFromCode: "A" | "B" | "C";
  edgeScore: number;
  cashDeltaInr: number;
}
