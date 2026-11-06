import { z } from "zod";
import type { ItemCondition } from "./enums";
import type { MarketplaceItemDto } from "./phase1-dtos";

/**
 * Prompt Injection Hygiene (System Design Section 12):
 * Treats all listing text as untrusted data and strips instruction-override attempts.
 */
export function sanitizeUntrustedListingPrompt(raw: string): {
  sanitized: string;
  injectionDetected: boolean;
} {
  const injectionRegex =
    /(ignore\s+(all\s+)?(previous|prior)\s+instructions|system\s*prompt|you\s+are\s+now|execute\s+command|<script\b)/gi;
  const injectionDetected = injectionRegex.test(raw);
  const sanitized = raw.replace(injectionRegex, "[REDACTED_UNTRUSTED_INSTRUCTION]").trim();
  return { sanitized, injectionDetected };
}

/**
 * Deterministic semantic vector generator & cosine similarity for local/CI pgvector search (BE-3.4)
 */
const SEMANTIC_BUCKETS = [
  ["camera", "fujifilm", "sony", "lens", "mirrorless", "photo", "dslr", "35mm"],
  ["guitar", "fender", "stratocaster", "music", "instrument", "amp", "synth", "audio"],
  ["ipad", "macbook", "apple", "laptop", "tablet", "pencil", "workstation", "monitor", "keyboard", "keychron"],
  ["ps5", "playstation", "gaming", "console", "controller", "nintendo", "xbox"],
  ["cycle", "bike", "bicycle", "urban", "commute", "gear", "helmet"],
  ["book", "campus", "textbook", "kindle", "study", "hostel"],
];

export function computeSemanticVector(text: string): number[] {
  const lower = text.toLowerCase();
  const vec = SEMANTIC_BUCKETS.map((bucket) => {
    let hits = 0;
    for (const word of bucket) {
      if (lower.includes(word)) hits += 1;
    }
    return hits;
  });
  const norm = Math.sqrt(vec.reduce((acc, v) => acc + v * v, 0)) || 1;
  return vec.map((v) => Math.round((v / norm) * 1000) / 1000);
}

export function computeCosineSimilarity(vecA: number[], vecB: number[]): number {
  const len = Math.min(vecA.length, vecB.length);
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < len; i++) {
    const a = vecA[i] ?? 0;
    const b = vecB[i] ?? 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  }
  if (magA === 0 || magB === 0) return 0;
  return Math.round((dot / (Math.sqrt(magA) * Math.sqrt(magB))) * 100) / 100;
}

export const AiIdentifyInputSchema = z.object({
  imageHint: z.string().min(1).max(200).default("fujifilm-camera"),
  userNotes: z.string().max(500).optional(),
});
export type AiIdentifyInput = z.infer<typeof AiIdentifyInputSchema>;

export const AiValuateInputSchema = z.object({
  title: z.string().min(2).max(150),
  categorySlug: z.string().default("workstation-audio"),
  condition: z.enum(["new", "like_new", "good", "fair", "parts"]).default("like_new"),
});
export type AiValuateInput = z.infer<typeof AiValuateInputSchema>;

export const AiValuationFeedbackSchema = z.object({
  itemTitle: z.string().min(1),
  vote: z.enum(["up", "down"]),
  userAdjustedMinInr: z.number().optional(),
  userAdjustedMaxInr: z.number().optional(),
});
export type AiValuationFeedbackInput = z.infer<typeof AiValuationFeedbackSchema>;

export interface AiIdentificationResult {
  jobId: string;
  cachedByImageHash: boolean;
  title: string;
  categorySlug: string;
  brand: string;
  model: string;
  conditionSuggested: ItemCondition;
  attributes: Record<string, string>;
  description: string;
  suggestedWants: string[];
  valuation: {
    estValueMinPaise: number;
    estValueMaxPaise: number;
    currency: "INR";
    confidence: number;
    label: "Estimated range, not a market price";
    basis: string;
  };
  promptSanitized: boolean;
}

export interface AiSemanticSearchResult {
  item: MarketplaceItemDto;
  cosineSimilarity: number;
  whyThisMatchChip: string;
}

export interface AiTelemetryDto {
  totalIdentifications: number;
  cacheHitCount: number;
  remainingDailyQuota: number;
  thumbsUpCount: number;
  thumbsDownCount: number;
  aiAssistedListingsSharePercent: number;
  medianListingTimeSeconds: number;
  phase3ExitGatePassed: boolean;
}
