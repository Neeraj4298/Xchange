/**
 * @xchange/api-sdk — Typed OpenAPI Client SDK (BE-0.4 & WEB-0.3)
 * Enforces contract-first communication between apps/web, apps/mobile, and apps/api.
 * Errors conform to RFC 9457 Problem Details (application/problem+json).
 */

import type {
  AdminMetricsDto,
  AdminReportDto,
  AiIdentificationResult,
  AiIdentifyInput,
  AiSemanticSearchResult,
  AiTelemetryDto,
  AiValuateInput,
  AiValuationFeedbackInput,
  CategoryDto,
  ChainCycleNodeDto,
  ChainProposalDto,
  ChainsTelemetryDto,
  ChatMessageDto,
  CityDto,
  ConfirmChainHandoffInput,
  ConfirmHandoverInput,
  ConversationDto,
  CounterOfferInput,
  CreateItemInput,
  CreateOfferInput,
  CreateReportInput,
  CreateReviewInput,
  CreateSavedSearchInput,
  FeaturedItemDto,
  InvoiceReceiptDto,
  MarketplaceItemDto,
  MatchCandidateDto,
  MatchFeedbackInput,
  MatchingTelemetryDto,
  NotificationDto,
  OfferDto,
  OtpRequestInput,
  OtpVerifyInput,
  PlanDto,
  ReviewDto,
  SafeMeetupPointDto,
  SavedSearchDto,
  ScheduleTradeInput,
  TradeDto,
  TradeEventDto,
  UpdateProfileInput,
  VerificationLevel,
} from "@xchange/shared";

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  code?: string;
}

export class ApiProblemError extends Error {
  public readonly status: number;
  public readonly problem: ProblemDetails;

  constructor(problem: ProblemDetails) {
    super(problem.detail || problem.title || `API Error (${problem.status})`);
    this.name = "ApiProblemError";
    this.status = problem.status;
    this.problem = problem;
  }
}

export interface HealthResponse {
  status: "ok" | "degraded";
  service: string;
  version: string;
  phase: string;
  timestamp: string;
  uptimeSeconds: number;
  checks: {
    database: string;
    redis: string;
    matchingEngine: string;
  };
}

export interface PlatformConfigResponse {
  version: string;
  launchCluster: string;
  featureFlags: {
    "ai.assist.enabled": boolean;
    "matching.feed.enabled": boolean;
    "chains.enabled": boolean;
    "billing.enabled": boolean;
    "city.bengaluru": boolean;
  };
  limits: {
    offerExpiryHours: number;
    chainAcceptanceHours: number;
    maxCashAdjustmentInr: number;
    safeMeetupRadiusKm: number;
  };
}

export interface OtpRequestResponse {
  requestId: string;
  phoneMasked: string;
  expiresInSeconds: number;
  resendAfterSeconds: number;
  devOtpPreview?: string;
}

export interface AuthenticatedUserDto {
  id: string;
  phoneMasked: string;
  name: string;
  neighbourhood: string;
  citySlug: string;
  verificationLevel: VerificationLevel;
  ratingAvg: number;
  tradesCompleted: number;
  joinedAt: string;
}

export interface OtpVerifyResponse {
  accessToken: string;
  expiresInSeconds: number;
  user: AuthenticatedUserDto;
}

export interface DiscoveryShowcaseResponse {
  cities: CityDto[];
  categories: CategoryDto[];
  featuredItems: FeaturedItemDto[];
  sampleThreeWayChain: {
    chainId: string;
    city: string;
    meetupPointName: string;
    meetupDistanceKm: number;
    expiresInHours: number;
    minEdgeScore: number;
    nodes: ChainCycleNodeDto[];
  };
}

export interface XchangeApiClientOptions {
  baseUrl?: string;
  getAccessToken?: () => string | null;
  fetchImpl?: typeof fetch;
}

export class XchangeApiClient {
  private readonly baseUrl: string;
  private readonly getAccessToken?: () => string | null;
  private readonly fetchImpl: typeof fetch;

  constructor(options: XchangeApiClientOptions = {}) {
    this.baseUrl = (
      options.baseUrl ||
      (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ||
      "http://localhost:4000"
    ).replace(/\/$/, "");
    this.getAccessToken = options.getAccessToken;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  private async request<T>(
    path: string,
    init: RequestInit & { idempotencyKey?: string } = {}
  ): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json, application/problem+json");
    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (init.idempotencyKey) {
      headers.set("Idempotency-Key", init.idempotencyKey);
    }
    const token = this.getAccessToken?.();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      ...init,
      headers,
    });

    if (!response.ok) {
      let problem: ProblemDetails = {
        type: "https://xchange.in/problems/internal-error",
        title: response.statusText || "Request failed",
        status: response.status,
      };
      try {
        const body = (await response.json()) as Partial<ProblemDetails>;
        problem = {
          ...problem,
          ...body,
          status: body.status ?? response.status,
        };
      } catch {
        // Fallback when error body is not JSON
      }
      throw new ApiProblemError(problem);
    }

    return (await response.json()) as T;
  }

  public getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>("/health");
  }

  public getConfig(): Promise<PlatformConfigResponse> {
    return this.request<PlatformConfigResponse>("/v1/config");
  }

  public getShowcase(): Promise<DiscoveryShowcaseResponse> {
    return this.request<DiscoveryShowcaseResponse>("/v1/showcase");
  }

  public getCities(): Promise<{ items: CityDto[] }> {
    return this.request<{ items: CityDto[] }>("/v1/cities");
  }

  public getCategories(): Promise<{ items: CategoryDto[] }> {
    return this.request<{ items: CategoryDto[] }>("/v1/categories");
  }

  public requestOtp(input: OtpRequestInput): Promise<OtpRequestResponse> {
    return this.request<OtpRequestResponse>("/v1/auth/otp/request", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  public verifyOtp(input: OtpVerifyInput): Promise<OtpVerifyResponse> {
    return this.request<OtpVerifyResponse>("/v1/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  public getMe(accessTokenOverride?: string): Promise<{ user: AuthenticatedUserDto }> {
    const headers: Record<string, string> = {};
    if (accessTokenOverride) {
      headers.Authorization = `Bearer ${accessTokenOverride}`;
    }
    return this.request<{ user: AuthenticatedUserDto }>("/v1/me", {
      method: "GET",
      headers,
    });
  }

  public googleSignIn(input: { email: string; name: string }): Promise<OtpVerifyResponse> {
    return this.request<OtpVerifyResponse>("/v1/auth/google", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  public updateProfile(input: UpdateProfileInput): Promise<{ user: AuthenticatedUserDto }> {
    return this.request<{ user: AuthenticatedUserDto }>("/v1/me", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  }

  public exportMyData(): Promise<{ exportedAt: string; data: Record<string, unknown> }> {
    return this.request<{ exportedAt: string; data: Record<string, unknown> }>("/v1/me/export", {
      method: "POST",
    });
  }

  public requestUploadUrl(filename: string): Promise<{ mediaId: string; uploadUrl: string; publicUrl: string }> {
    return this.request("/v1/media/upload-url", {
      method: "POST",
      body: JSON.stringify({ filename }),
    });
  }

  public getFeed(params?: {
    tab?: string;
    q?: string;
    category?: string;
    condition?: string;
    maxDistanceKm?: number;
  }): Promise<{ items: MarketplaceItemDto[]; total: number }> {
    const qs = new URLSearchParams();
    if (params?.tab) qs.set("tab", params.tab);
    if (params?.q) qs.set("q", params.q);
    if (params?.category) qs.set("category", params.category);
    if (params?.condition) qs.set("condition", params.condition);
    if (params?.maxDistanceKm) qs.set("maxDistanceKm", String(params.maxDistanceKm));
    const queryString = qs.toString() ? `?${qs.toString()}` : "";
    return this.request<{ items: MarketplaceItemDto[]; total: number }>(`/v1/feed${queryString}`);
  }

  public getItemById(id: string): Promise<{ item: MarketplaceItemDto }> {
    return this.request<{ item: MarketplaceItemDto }>(`/v1/items/${id}`);
  }

  public getMyItems(): Promise<{ items: MarketplaceItemDto[] }> {
    return this.request<{ items: MarketplaceItemDto[] }>("/v1/me/items");
  }

  public createItem(input: CreateItemInput, idempotencyKey?: string): Promise<{ item: MarketplaceItemDto }> {
    return this.request<{ item: MarketplaceItemDto }>("/v1/items", {
      method: "POST",
      body: JSON.stringify(input),
      idempotencyKey,
    });
  }

  public updateItemStatus(id: string, action: "publish" | "pause" | "delete"): Promise<{ item: MarketplaceItemDto }> {
    return this.request<{ item: MarketplaceItemDto }>(`/v1/items/${id}/${action}`, {
      method: "POST",
    });
  }

  public toggleSaveItem(id: string): Promise<{ saved: boolean; savedIds: string[] }> {
    return this.request<{ saved: boolean; savedIds: string[] }>(`/v1/saved-items/${id}`, {
      method: "POST",
    });
  }

  public getOffers(tab?: string): Promise<{ items: OfferDto[] }> {
    const qs = tab ? `?tab=${encodeURIComponent(tab)}` : "";
    return this.request<{ items: OfferDto[] }>(`/v1/offers${qs}`);
  }

  public createOffer(
    input: {
      recipientItemId: string;
      offeredItemIds: string[];
      cash: { amountPaise: number; direction: "none" | "proposer_pays" | "recipient_pays" };
      message?: string;
    },
    idempotencyKey?: string
  ): Promise<{ offer: OfferDto }> {
    return this.request<{ offer: OfferDto }>("/v1/offers", {
      method: "POST",
      body: JSON.stringify(input),
      idempotencyKey,
    });
  }

  public counterOffer(id: string, input: CounterOfferInput): Promise<{ offer: OfferDto }> {
    return this.request<{ offer: OfferDto }>(`/v1/offers/${id}/counter`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  public acceptOffer(id: string, idempotencyKey?: string): Promise<{ offer: OfferDto; trade: TradeDto }> {
    return this.request<{ offer: OfferDto; trade: TradeDto }>(`/v1/offers/${id}/accept`, {
      method: "POST",
      idempotencyKey,
    });
  }

  public rejectOffer(id: string): Promise<{ offer: OfferDto }> {
    return this.request<{ offer: OfferDto }>(`/v1/offers/${id}/reject`, {
      method: "POST",
    });
  }

  public withdrawOffer(id: string): Promise<{ offer: OfferDto }> {
    return this.request<{ offer: OfferDto }>(`/v1/offers/${id}/withdraw`, {
      method: "POST",
    });
  }

  public getTrades(): Promise<{ items: TradeDto[]; safePoints: SafeMeetupPointDto[] }> {
    return this.request<{ items: TradeDto[]; safePoints: SafeMeetupPointDto[] }>("/v1/trades");
  }

  public getTradeById(id: string): Promise<{ trade: TradeDto; safePoints: SafeMeetupPointDto[] }> {
    return this.request<{ trade: TradeDto; safePoints: SafeMeetupPointDto[] }>(`/v1/trades/${id}`);
  }

  public scheduleTrade(id: string, input: ScheduleTradeInput): Promise<{ trade: TradeDto }> {
    return this.request<{ trade: TradeDto }>(`/v1/trades/${id}/schedule`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  public confirmTradeHandover(id: string, input: ConfirmHandoverInput): Promise<{ trade: TradeDto }> {
    return this.request<{ trade: TradeDto }>(`/v1/trades/${id}/confirm`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  public cancelTrade(id: string, reason: string): Promise<{ trade: TradeDto }> {
    return this.request<{ trade: TradeDto }>(`/v1/trades/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  }

  public disputeTrade(id: string, reason: string): Promise<{ trade: TradeDto; report: AdminReportDto }> {
    return this.request<{ trade: TradeDto; report: AdminReportDto }>(`/v1/trades/${id}/dispute`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  }

  public getConversations(): Promise<{ items: ConversationDto[] }> {
    return this.request<{ items: ConversationDto[] }>("/v1/conversations");
  }

  public getMessages(conversationId: string): Promise<{ items: ChatMessageDto[]; tradeAccepted: boolean }> {
    return this.request<{ items: ChatMessageDto[]; tradeAccepted: boolean }>(
      `/v1/conversations/${conversationId}/messages`
    );
  }

  public sendMessage(conversationId: string, body: string): Promise<{ message: ChatMessageDto }> {
    return this.request<{ message: ChatMessageDto }>(`/v1/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
  }

  public submitReview(tradeId: string, input: CreateReviewInput): Promise<{ reviews: ReviewDto[] }> {
    return this.request<{ reviews: ReviewDto[] }>(`/v1/trades/${tradeId}/reviews`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  public getNotifications(): Promise<{ items: NotificationDto[] }> {
    return this.request<{ items: NotificationDto[] }>("/v1/notifications");
  }

  public markNotificationsRead(): Promise<{ ok: boolean }> {
    return this.request<{ ok: boolean }>("/v1/notifications/read", {
      method: "POST",
    });
  }

  public createReport(input: CreateReportInput): Promise<{ report: AdminReportDto }> {
    return this.request<{ report: AdminReportDto }>("/v1/reports", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  public getAdminDashboard(): Promise<{
    metrics: AdminMetricsDto;
    reports: AdminReportDto[];
    auditEvents: TradeEventDto[];
  }> {
    return this.request("/v1/admin/dashboard");
  }

  public resolveAdminReport(
    reportId: string,
    action: "dismiss" | "warn" | "remove_item" | "suspend_user"
  ): Promise<{ report: AdminReportDto }> {
    return this.request<{ report: AdminReportDto }>(`/v1/admin/reports/${reportId}/resolve`, {
      method: "POST",
      body: JSON.stringify({ action }),
    });
  }

  public getMatches(): Promise<{
    items: MatchCandidateDto[];
    telemetry: MatchingTelemetryDto;
  }> {
    return this.request("/v1/matches");
  }

  public recordMatchFeedback(
    matchId: string,
    action: MatchFeedbackInput["action"]
  ): Promise<{ match: MatchCandidateDto; telemetry: MatchingTelemetryDto }> {
    return this.request(`/v1/matches/${matchId}/feedback`, {
      method: "POST",
      body: JSON.stringify({ action }),
    });
  }

  public createOfferFromMatch(
    matchId: string,
    cashPaise = 0,
    message = "1-click swap proposal from Smart Match recommendation!"
  ): Promise<{ offer: OfferDto; telemetry: MatchingTelemetryDto }> {
    return this.request(`/v1/matches/${matchId}/offer`, {
      method: "POST",
      body: JSON.stringify({ cashPaise, message }),
    });
  }

  public getSavedSearches(): Promise<{ items: SavedSearchDto[] }> {
    return this.request<{ items: SavedSearchDto[] }>("/v1/saved-searches");
  }

  public createSavedSearch(input: CreateSavedSearchInput): Promise<{ savedSearch: SavedSearchDto }> {
    return this.request<{ savedSearch: SavedSearchDto }>("/v1/saved-searches", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  public toggleSavedSearchAlert(id: string): Promise<{ savedSearch: SavedSearchDto }> {
    return this.request<{ savedSearch: SavedSearchDto }>(`/v1/saved-searches/${id}/toggle-alert`, {
      method: "POST",
    });
  }

  public deleteSavedSearch(id: string): Promise<{ deleted: boolean }> {
    return this.request<{ deleted: boolean }>(`/v1/saved-searches/${id}`, {
      method: "DELETE",
    });
  }

  public aiIdentifyItem(
    input: AiIdentifyInput
  ): Promise<{ suggestion: AiIdentificationResult; telemetry: AiTelemetryDto }> {
    return this.request("/v1/ai/identify", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  public aiEstimateValue(
    input: AiValuateInput
  ): Promise<{
    valuation: AiIdentificationResult["valuation"];
    telemetry: AiTelemetryDto;
  }> {
    return this.request("/v1/ai/value", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  public aiRecordValuationFeedback(
    input: AiValuationFeedbackInput
  ): Promise<{ ok: boolean; telemetry: AiTelemetryDto }> {
    return this.request("/v1/ai/value-feedback", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  public aiSemanticSearch(query: string): Promise<{ results: AiSemanticSearchResult[] }> {
    return this.request("/v1/ai/semantic-search", {
      method: "POST",
      body: JSON.stringify({ query }),
    });
  }

  public getAiTelemetry(): Promise<{ telemetry: AiTelemetryDto }> {
    return this.request("/v1/ai/telemetry");
  }

  public getChainProposals(): Promise<{
    proposals: ChainProposalDto[];
    telemetry: ChainsTelemetryDto;
  }> {
    return this.request("/v1/me/chain-proposals");
  }

  public acceptChainProposal(
    chainId: string,
    participantCode: "A" | "B" | "C" = "C"
  ): Promise<{ proposal: ChainProposalDto; telemetry: ChainsTelemetryDto }> {
    return this.request(`/v1/chains/${chainId}/accept`, {
      method: "POST",
      body: JSON.stringify({ participantCode }),
    });
  }

  public declineChainProposal(
    chainId: string,
    participantCode: "A" | "B" | "C" = "C"
  ): Promise<{ proposal: ChainProposalDto; telemetry: ChainsTelemetryDto }> {
    return this.request(`/v1/chains/${chainId}/decline`, {
      method: "POST",
      body: JSON.stringify({ participantCode }),
    });
  }

  public confirmChainHandoff(
    chainId: string,
    input: ConfirmChainHandoffInput
  ): Promise<{ proposal: ChainProposalDto; telemetry: ChainsTelemetryDto }> {
    return this.request(`/v1/chains/${chainId}/confirm-handoff`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  public verifyGovernmentId(documentType = "Aadhaar_DigiLocker"): Promise<{
    verified: boolean;
    verificationLevel: "id";
    badgeLabel: string;
  }> {
    return this.request("/v1/me/verify-id", {
      method: "POST",
      body: JSON.stringify({ documentType }),
    });
  }

  public getBillingPlans(): Promise<{
    plans: PlanDto[];
    activePlanCode: "free" | "xchange_plus";
    invoices: InvoiceReceiptDto[];
  }> {
    return this.request("/v1/plans");
  }

  public subscribePlusPlan(): Promise<{
    activePlanCode: "xchange_plus";
    invoice: InvoiceReceiptDto;
  }> {
    return this.request("/v1/billing/subscribe", {
      method: "POST",
    });
  }

  public promoteListing(itemId: string, days = 7): Promise<{
    promotedItemId: string;
    invoice: InvoiceReceiptDto;
  }> {
    return this.request("/v1/promotions", {
      method: "POST",
      body: JSON.stringify({ itemId, days }),
    });
  }
}

export function createXchangeApiClient(options?: XchangeApiClientOptions): XchangeApiClient {
  return new XchangeApiClient(options);
}
