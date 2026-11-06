import { z } from "zod";
import { CASH_DIRECTIONS, ITEM_CONDITIONS } from "./enums";

export const CreateItemSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(2000),
  categorySlug: z.string().min(2),
  condition: z.enum(ITEM_CONDITIONS),
  estValueMinPaise: z.number().int().min(10000),
  estValueMaxPaise: z.number().int().min(10000),
  locationLat: z.number().min(-90).max(90).default(12.97),
  locationLng: z.number().min(-180).max(180).default(77.64),
  neighbourhood: z.string().min(2).default("Indiranagar"),
  imageUrls: z.array(z.string()).min(1).max(8).default(["gradient:emerald"]),
  publishImmediately: z.boolean().default(true),
  wants: z
    .object({
      categorySlug: z.string().optional(),
      keywords: z.array(z.string()).default([]),
      minCondition: z.enum(ITEM_CONDITIONS).default("good"),
      openToCash: z.boolean().default(true),
      openToAnything: z.boolean().default(false),
      maxDistanceM: z.number().int().min(1000).max(50000).default(8000),
    })
    .default({}),
});
export type CreateItemInput = z.infer<typeof CreateItemSchema>;

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  bio: z.string().max(300).optional(),
  neighbourhood: z.string().min(2).max(80).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

export const CounterOfferSchema = z.object({
  offeredItemIds: z.array(z.string()).min(1).max(5).optional(),
  cash: z
    .object({
      amountPaise: z.number().int().min(0).max(5_000_000),
      direction: z.enum(CASH_DIRECTIONS),
    })
    .optional(),
  message: z.string().max(500).optional(),
});
export type CounterOfferInput = z.infer<typeof CounterOfferSchema>;

export const ScheduleTradeSchema = z.object({
  safePointId: z.string().min(1),
  scheduledAt: z.string().min(1),
});
export type ScheduleTradeInput = z.infer<typeof ScheduleTradeSchema>;

export const ConfirmHandoverSchema = z.object({
  handoverCode: z.string().regex(/^\d{6}$/, "Enter the 6-digit handover code"),
  actorUserId: z.string().optional(),
});
export type ConfirmHandoverInput = z.infer<typeof ConfirmHandoverSchema>;

export const CreateReviewSchema = z.object({
  stars: z.number().int().min(1).max(5),
  tags: z.array(z.string()).default(["accurate_listing", "punctual"]),
  comment: z.string().max(600).default(""),
});
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;

export const CreateReportSchema = z.object({
  targetType: z.enum(["item", "user", "message", "trade"]),
  targetId: z.string().min(1),
  reason: z.string().min(3).max(120),
  details: z.string().max(1000).default(""),
});
export type CreateReportInput = z.infer<typeof CreateReportSchema>;

/**
 * Masks phone numbers and external URLs in chat messages before trade acceptance (FR-CHT-2)
 */
export function maskSensitiveChatContent(
  text: string,
  tradeAccepted: boolean
): { sanitized: string; wasMasked: boolean } {
  if (tradeAccepted) {
    return { sanitized: text, wasMasked: false };
  }
  const phoneRegex = /(\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}|\b\d{10}\b/g;
  const urlRegex = /https?:\/\/[^\s]+|www\.[^\s]+|\b[a-z0-9-]+\.(com|in|org|net|io)\b/gi;
  let wasMasked = false;
  let sanitized = text.replace(phoneRegex, () => {
    wasMasked = true;
    return "[Phone hidden until trade accepted]";
  });
  sanitized = sanitized.replace(urlRegex, () => {
    wasMasked = true;
    return "[Link hidden until trade accepted]";
  });
  return { sanitized, wasMasked };
}
