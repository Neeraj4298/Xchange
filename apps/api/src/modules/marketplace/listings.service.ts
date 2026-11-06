import crypto from "node:crypto";
import {
  CreateItemSchema,
  checkProhibitedContent,
  snapToOneKmGrid,
  type MarketplaceItemDto,
} from "@xchange/shared";
import { SEED_CATEGORIES } from "../../../prisma/seed-data";
import { AuthServiceError } from "../auth/auth.service";
import type { MarketplaceStateStore } from "./marketplace.seed";

const GRADIENTS = [
  "from-emerald-500/30 via-teal-500/20 to-cyan-500/30",
  "from-amber-500/30 via-orange-500/20 to-emerald-500/25",
  "from-cyan-500/30 via-sky-500/20 to-indigo-500/30",
  "from-teal-500/30 via-emerald-500/20 to-lime-500/25",
];

export class ListingsService {
  constructor(private readonly store: MarketplaceStateStore) {}

  public requestSignedUploadUrl(filename: string) {
    const mediaId = crypto.randomUUID();
    const safe = (filename || "item.webp").replace(/[^a-zA-Z0-9._-]/g, "-");
    return {
      mediaId,
      uploadUrl: `http://localhost:9000/xchange-media/uploads/${mediaId}-${safe}`,
      publicUrl: `http://localhost:9000/xchange-media/items/${mediaId}-${safe}`,
      exifStripped: true,
    };
  }

  public getItemById(id: string): { item: MarketplaceItemDto } {
    const found = this.store.items.find((i) => i.id === id);
    if (!found) throw new AuthServiceError(404, "NOT_FOUND", "Item not found", `Item ${id} missing.`);
    return { item: { ...found, savedByMe: this.store.savedItemIds.has(found.id) } };
  }

  public getMyItems(ownerId = "user-demo-aarav"): { items: MarketplaceItemDto[] } {
    const items = this.store.items.filter(
      (i) => (i.ownerId === ownerId || i.ownerName.startsWith("Aarav")) && i.status !== "removed"
    );
    return { items };
  }

  public createItem(rawInput: unknown, owner = { id: "user-demo-aarav", name: "Aarav V." }) {
    const parsed = CreateItemSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new AuthServiceError(
        422,
        "VALIDATION",
        "Invalid listing input",
        parsed.error.issues[0]?.message || "Validation failed"
      );
    }
    const d = parsed.data;
    const policy = checkProhibitedContent(
      `${d.title} ${d.description} ${d.wants.keywords.join(" ")}`,
      d.categorySlug
    );
    if (!policy.allowed) {
      throw new AuthServiceError(
        422,
        "PROHIBITED_ITEM",
        "Blocked by Trust & Safety policy (FR-LST-4)",
        policy.reason || "Prohibited item"
      );
    }
    const cat = SEED_CATEGORIES.find((c) => c.slug === d.categorySlug);
    const rounded = snapToOneKmGrid(d.locationLat, d.locationLng);
    const now = new Date();
    const item: MarketplaceItemDto = {
      id: crypto.randomUUID(),
      ownerId: owner.id,
      ownerName: owner.name,
      ownerRating: 4.92,
      ownerVerified: "phone",
      title: d.title,
      description: d.description,
      categorySlug: d.categorySlug,
      categoryName: cat?.name || "General Exchange",
      condition: d.condition,
      estValueMinPaise: d.estValueMinPaise,
      estValueMaxPaise: Math.max(d.estValueMinPaise, d.estValueMaxPaise),
      valueConfidence: 0.9,
      neighbourhood: d.neighbourhood,
      locationLat: rounded.lat,
      locationLng: rounded.lng,
      distanceKm: 1.5,
      status: d.publishImmediately ? "active" : "draft",
      lockedByTradeId: null,
      wantsSummary:
        d.wants.keywords.length > 0
          ? d.wants.keywords
          : [d.wants.openToAnything ? "Open to any fair swap" : "Gadgets / Audio"],
      openToCash: d.wants.openToCash,
      openToAnything: d.wants.openToAnything,
      maxDistanceM: d.wants.maxDistanceM,
      matchScore: 91,
      imageGradient: GRADIENTS[this.store.items.length % GRADIENTS.length]!,
      badge: "New Listing",
      savedByMe: false,
      publishedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 60 * 24 * 3600 * 1000).toISOString(),
    };
    this.store.items.unshift(item);
    return { item };
  }

  public updateItemStatus(id: string, action: "publish" | "pause" | "delete") {
    const item = this.store.items.find((i) => i.id === id);
    if (!item) throw new AuthServiceError(404, "NOT_FOUND", "Item not found", "Missing.");
    if (item.status === "locked") {
      throw new AuthServiceError(409, "ITEM_LOCKED", "Item locked", "Item locked in trade.");
    }
    if (action === "publish") item.status = "active";
    if (action === "pause") item.status = "paused";
    if (action === "delete") item.status = "removed";
    return { item };
  }
}
