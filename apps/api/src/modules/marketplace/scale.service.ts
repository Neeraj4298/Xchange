import crypto from "node:crypto";
import {
  BulkUploadListingSchema,
  tuneMatchingWeights,
  type CityDto,
  type DeliveryPartnerQuoteDto,
  type FourWayChainDto,
  type ScaleOverviewResponse,
  type TunedMatchingWeightsDto,
} from "@xchange/shared";
import { SEED_CITIES } from "../../../prisma/seed-data";
import { AuthServiceError } from "../auth/auth.service";
import type { MarketplaceStateStore } from "./marketplace.seed";

export class ScaleService {
  private readonly cities: CityDto[] = [
    ...SEED_CITIES.map((c) => ({ ...c })),
    {
      id: "01960000-0000-7000-8000-000000000003",
      name: "Pune",
      slug: "pune",
      enabled: false,
      neighbourhoods: ["Koregaon Park", "Baner", "Viman Nagar", "Kothrud"],
      activeListingsCount: 0,
      completedChainsCount: 0,
    },
  ];

  private readonly fourWayChain: FourWayChainDto = {
    id: "chain-4way-401",
    city: "Bengaluru",
    status: "accepted",
    minEdgeScore: 91,
    meetupHub: "Indiranagar Metro Safe Exchange Zone (Coordinated 4-Party Bay)",
    nodes: [
      {
        code: "A",
        traderName: "Rohan K.",
        trustScoreV2: 98,
        neighbourhood: "Indiranagar",
        givesTitle: "Fujifilm X-T30 II Mirrorless",
        receivesFromCode: "D",
        handoverStep: 1,
        handoverCode: "401111",
        confirmed: false,
      },
      {
        code: "B",
        traderName: "Meera S.",
        trustScoreV2: 96,
        neighbourhood: "Koramangala",
        givesTitle: "Fender Player Stratocaster",
        receivesFromCode: "A",
        handoverStep: 2,
        handoverCode: "401222",
        confirmed: false,
      },
      {
        code: "C",
        traderName: "Aarav V.",
        trustScoreV2: 97,
        neighbourhood: "HSR Layout",
        givesTitle: "iPad Pro 11\" M2 + Pencil 2",
        receivesFromCode: "B",
        handoverStep: 3,
        handoverCode: "401333",
        confirmed: false,
      },
      {
        code: "D",
        traderName: "Divya R.",
        trustScoreV2: 95,
        neighbourhood: "Whitefield",
        givesTitle: "Sony FE 24-70mm f/2.8 GM Lens",
        receivesFromCode: "C",
        handoverStep: 4,
        handoverCode: "401444",
        confirmed: false,
      },
    ],
  };

  private tunedWeights: TunedMatchingWeightsDto = tuneMatchingWeights(48, 32);
  private businessListingsCreated = 6;

  constructor(private readonly store: MarketplaceStateStore) {}

  public getOverview(): ScaleOverviewResponse {
    return {
      locales: ["en-IN", "kn-IN", "hi-IN"],
      cities: this.cities,
      fourWayChain: this.fourWayChain,
      tunedWeights: this.tunedWeights,
      businessListingsCreated: this.businessListingsCreated,
    };
  }

  public enableCity(slug: string) {
    const city = this.cities.find((c) => c.slug === slug);
    if (!city) throw new AuthServiceError(404, "NOT_FOUND", "City not found", "Missing.");
    city.enabled = true;
    city.name = city.name.replace(/\s*\(v1\.5 Waitlist\)/, "");
    if (city.activeListingsCount === 0) {
      city.activeListingsCount = 215;
      city.completedChainsCount = 14;
    }
    return { cities: this.cities };
  }

  public confirmFourWayStep(step: number) {
    const node = this.fourWayChain.nodes.find((n) => n.handoverStep === step);
    if (!node) throw new AuthServiceError(404, "NOT_FOUND", "Step not found", "Invalid step.");
    node.confirmed = true;
    const allDone = this.fourWayChain.nodes.every((n) => n.confirmed);
    this.fourWayChain.status = allDone ? "completed" : "partially_confirmed";
    return { fourWayChain: this.fourWayChain };
  }

  public getDeliveryQuote(distanceKm = 4.2): { quote: DeliveryPartnerQuoteDto } {
    const fee = Math.round(45 + distanceKm * 12);
    const commission = Math.round(fee * 0.1);
    return {
      quote: {
        partnerName: "Porter / Dunzo Hyperlocal Courier",
        distanceKm,
        estimatedPartnerFeeInr: fee,
        platformReferralCommissionInr: commission,
        etaMinutes: Math.round(18 + distanceKm * 3.5),
      },
    };
  }

  public bulkUploadBusiness(rawInput: unknown) {
    const parsed = BulkUploadListingSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new AuthServiceError(422, "VALIDATION", "Invalid bulk upload", "Validation failed.");
    }
    const now = new Date();
    for (const entry of parsed.data.items) {
      this.store.items.unshift({
        id: crypto.randomUUID(),
        ownerId: "user-b2b-partner",
        ownerName: `${parsed.data.businessName} (B2B)`,
        ownerRating: 4.96,
        ownerVerified: "id",
        title: entry.title,
        description: `B2B Surplus / Refurbished (${parsed.data.gstin})`,
        categorySlug: entry.categorySlug,
        categoryName: "Business Surplus",
        condition: "like_new",
        estValueMinPaise: entry.estValueInr * 90,
        estValueMaxPaise: entry.estValueInr * 110,
        valueConfidence: 0.94,
        neighbourhood: "Indiranagar B2B Hub",
        locationLat: 12.97,
        locationLng: 77.64,
        distanceKm: 2.1,
        status: "active",
        lockedByTradeId: null,
        wantsSummary: [entry.wantsKeyword],
        openToCash: true,
        openToAnything: false,
        maxDistanceM: 12000,
        matchScore: 90,
        imageGradient: "from-emerald-500/30 via-teal-500/20 to-cyan-500/30",
        badge: "B2B Bulk Verified",
        savedByMe: false,
        publishedAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 60 * 24 * 3600 * 1000).toISOString(),
      });
    }
    this.businessListingsCreated += parsed.data.items.length;
    return {
      createdCount: parsed.data.items.length,
      businessListingsCreated: this.businessListingsCreated,
    };
  }

  public runWeightTuning(acceptedCount = 62, rejectedCount = 28) {
    this.tunedWeights = tuneMatchingWeights(acceptedCount, rejectedCount);
    return { tunedWeights: this.tunedWeights };
  }
}
