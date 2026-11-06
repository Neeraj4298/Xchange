import type {
  CashDirection,
  ItemCondition,
  ItemStatus,
  OfferOrigin,
  OfferStatus,
  TradeKind,
  TradeStatus,
  VerificationLevel,
} from "./enums";

export interface MarketplaceItemDto {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerRating: number;
  ownerVerified: VerificationLevel;
  title: string;
  description: string;
  categorySlug: string;
  categoryName: string;
  condition: ItemCondition;
  estValueMinPaise: number;
  estValueMaxPaise: number;
  valueConfidence: number;
  neighbourhood: string;
  locationLat: number;
  locationLng: number;
  distanceKm: number;
  status: ItemStatus;
  lockedByTradeId?: string | null;
  wantsSummary: string[];
  openToCash: boolean;
  openToAnything: boolean;
  maxDistanceM: number;
  matchScore: number;
  imageGradient: string;
  badge?: string;
  savedByMe?: boolean;
  publishedAt: string;
  expiresAt: string;
}

export interface OfferDto {
  id: string;
  threadId: string;
  version: number;
  proposerId: string;
  proposerName: string;
  recipientId: string;
  recipientName: string;
  recipientItem: MarketplaceItemDto;
  offeredItems: MarketplaceItemDto[];
  status: OfferStatus;
  cashPaise: number;
  cashDirection: CashDirection;
  message: string;
  origin: OfferOrigin;
  expiresAt: string;
  createdAt: string;
  tradeId?: string;
}

export interface SafeMeetupPointDto {
  id: string;
  name: string;
  neighbourhood: string;
  landmarkType: "metro" | "mall" | "police_adjacent" | "campus";
  lat: number;
  lng: number;
  cctvVerified: boolean;
}

export interface TradeEventDto {
  id: string;
  tradeId: string;
  actorId: string;
  actorName: string;
  type: string;
  payload: Record<string, unknown>;
  at: string;
}

export interface TradeParticipantDto {
  userId: string;
  userName: string;
  givesItemId: string;
  givesItemTitle: string;
  receivesItemId: string;
  receivesItemTitle: string;
  cashInPaise: number;
  cashOutPaise: number;
  handoverCodeDemo: string;
  confirmedReceivedAt?: string | null;
  status: "invited" | "accepted" | "confirmed" | "declined" | "no_show";
}

export interface TradeDto {
  id: string;
  kind: TradeKind;
  status: TradeStatus;
  sourceOfferId?: string;
  scheduledAt?: string | null;
  meetupPlace?: SafeMeetupPointDto | null;
  cancelledReason?: string | null;
  completedAt?: string | null;
  createdAt: string;
  participants: TradeParticipantDto[];
  events: TradeEventDto[];
}

export interface ChatMessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  type: "text" | "image" | "system";
  body: string;
  maskedWarning?: boolean;
  createdAt: string;
}

export interface ConversationDto {
  id: string;
  threadId: string;
  title: string;
  participantNames: string[];
  tradeAccepted: boolean;
  unreadCount: number;
  lastMessage?: ChatMessageDto;
}

export interface ReviewDto {
  id: string;
  tradeId: string;
  reviewerId: string;
  reviewerName: string;
  revieweeId: string;
  revieweeName: string;
  stars: number;
  tags: string[];
  comment: string;
  revealed: boolean;
  createdAt: string;
}

export interface NotificationDto {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  readAt?: string | null;
  createdAt: string;
}

export interface AdminReportDto {
  id: string;
  reporterId: string;
  targetType: "item" | "user" | "message" | "trade";
  targetId: string;
  reason: string;
  details: string;
  status: "open" | "resolved" | "dismissed";
  resolution?: string;
  createdAt: string;
}

export interface AdminMetricsDto {
  activeListings: number;
  completedTrades: number;
  exchangesPer100Listings: number;
  medianTimeToFirstOfferHours: number;
  offerAcceptanceRatePercent: number;
  disputeRatePercent: number;
  openReportsCount: number;
  completedThreeWayChains: number;
}
