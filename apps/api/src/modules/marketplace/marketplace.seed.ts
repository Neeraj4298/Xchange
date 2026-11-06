import type {
  AdminReportDto,
  ChatMessageDto,
  ConversationDto,
  MarketplaceItemDto,
  NotificationDto,
  OfferDto,
  ReviewDto,
  SafeMeetupPointDto,
  TradeDto,
  TradeEventDto,
} from "@xchange/shared";
import { SEED_FEATURED_ITEMS } from "../../../prisma/seed-data";

export const SAFE_MEETUP_POINTS: SafeMeetupPointDto[] = [
  {
    id: "sp-indiranagar-metro",
    name: "Indiranagar Metro Station — Safe Exchange Zone (Bay 2)",
    neighbourhood: "Indiranagar",
    landmarkType: "metro",
    lat: 12.9784,
    lng: 77.6408,
    cctvVerified: true,
  },
  {
    id: "sp-koramangala-bda",
    name: "Koramangala BDA Complex — Police Outpost Courtyard",
    neighbourhood: "Koramangala",
    landmarkType: "police_adjacent",
    lat: 12.9317,
    lng: 77.6227,
    cctvVerified: true,
  },
  {
    id: "sp-hsr-sector2",
    name: "HSR Layout Sector 2 — 27th Main Public Plaza",
    neighbourhood: "HSR Layout",
    landmarkType: "mall",
    lat: 12.9116,
    lng: 77.6474,
    cctvVerified: true,
  },
  {
    id: "sp-whitefield-nexus",
    name: "Nexus Shantiniketan Atrium — Whitefield Safe Point",
    neighbourhood: "Whitefield",
    landmarkType: "mall",
    lat: 12.9896,
    lng: 77.7282,
    cctvVerified: true,
  },
];

export function createInitialMarketplaceItems(): MarketplaceItemDto[] {
  const now = new Date();
  const expires = new Date(now.getTime() + 60 * 24 * 3600 * 1000).toISOString();
  const coords = [
    { lat: 12.97, lng: 77.64 },
    { lat: 12.93, lng: 77.62 },
    { lat: 12.91, lng: 77.65 },
    { lat: 12.99, lng: 77.73 },
  ];

  return SEED_FEATURED_ITEMS.map((f, idx) => ({
    id: f.id,
    ownerId: idx === 2 ? "user-demo-aarav" : `user-seed-${idx + 1}`,
    ownerName: f.ownerName,
    ownerRating: f.ownerRating,
    ownerVerified: f.ownerVerified,
    title: f.title,
    description: `${f.title} — carefully maintained in ${f.neighbourhood}. Includes original accessories. Ready for local Bengaluru safe-point handover.`,
    categorySlug: f.categorySlug,
    categoryName: f.categoryName,
    condition: f.condition,
    estValueMinPaise: f.estValueMinPaise,
    estValueMaxPaise: f.estValueMaxPaise,
    valueConfidence: f.valueConfidence,
    neighbourhood: f.neighbourhood,
    locationLat: coords[idx]?.lat ?? 12.97,
    locationLng: coords[idx]?.lng ?? 77.64,
    distanceKm: f.distanceKm,
    status: "active",
    lockedByTradeId: null,
    wantsSummary: f.wantsSummary,
    openToCash: f.openToCash,
    openToAnything: false,
    maxDistanceM: 8000,
    matchScore: f.matchScore,
    imageGradient: f.imageGradient,
    badge: f.badge,
    savedByMe: idx === 0,
    publishedAt: new Date(now.getTime() - (idx + 1) * 3600 * 1000).toISOString(),
    expiresAt: expires,
  }));
}

export interface MarketplaceStateStore {
  items: MarketplaceItemDto[];
  savedItemIds: Set<string>;
  offers: OfferDto[];
  trades: TradeDto[];
  tradeEvents: TradeEventDto[];
  conversations: ConversationDto[];
  messages: Map<string, ChatMessageDto[]>;
  reviews: ReviewDto[];
  notifications: NotificationDto[];
  reports: AdminReportDto[];
}

export function createInitialMarketplaceStore(): MarketplaceStateStore {
  const items = createInitialMarketplaceItems();
  const item0 = items[0]!;
  const item2 = items[2]!;
  const now = new Date();
  const offerExpiry = new Date(now.getTime() + 72 * 3600 * 1000).toISOString();

  const initialOffer: OfferDto = {
    id: "offer-seed-101",
    threadId: "thread-seed-101",
    version: 1,
    proposerId: "user-seed-1",
    proposerName: "Rohan K.",
    recipientId: "user-demo-aarav",
    recipientName: "Aarav V.",
    recipientItem: item2,
    offeredItems: [item0],
    status: "pending",
    cashPaise: 200_000,
    cashDirection: "recipient_pays",
    message: "Hey Aarav! Would love to swap my Fujifilm X-T30 II kit for your iPad Pro M2 + ₹2,000 adjustment.",
    origin: "match",
    expiresAt: offerExpiry,
    createdAt: now.toISOString(),
  };

  const convId = "conv-seed-101";
  const initialMsg: ChatMessageDto = {
    id: "msg-seed-1",
    conversationId: convId,
    senderId: "user-seed-1",
    senderName: "Rohan K.",
    type: "text",
    body: "Hi Aarav! My Fujifilm X-T30 II has under 3,200 shutter clicks. Can meet at Indiranagar Metro Bay 2.",
    createdAt: now.toISOString(),
  };

  return {
    items,
    savedItemIds: new Set([item0.id]),
    offers: [initialOffer],
    trades: [],
    tradeEvents: [],
    conversations: [
      {
        id: convId,
        threadId: "thread-seed-101",
        title: "Fujifilm X-T30 II ⇄ iPad Pro 11\" M2",
        participantNames: ["Rohan K.", "Aarav V."],
        tradeAccepted: false,
        unreadCount: 1,
        lastMessage: initialMsg,
      },
    ],
    messages: new Map([[convId, [initialMsg]]]),
    reviews: [],
    notifications: [
      {
        id: "notif-seed-1",
        userId: "user-demo-aarav",
        type: "offer.new",
        title: "New 96% Match Offer from Rohan K.",
        body: "Rohan K. offered Fujifilm X-T30 II Mirrorless for your iPad Pro 11\" M2.",
        readAt: null,
        createdAt: now.toISOString(),
      },
    ],
    reports: [
      {
        id: "rep-seed-1",
        reporterId: "user-seed-2",
        targetType: "item",
        targetId: "item-flagged-demo",
        reason: "Suspected replica headphones",
        details: "Serial number photo looks blurry; requesting moderator verification.",
        status: "open",
        createdAt: now.toISOString(),
      },
    ],
  };
}
