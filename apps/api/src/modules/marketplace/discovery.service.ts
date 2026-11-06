import type { MarketplaceStateStore } from "./marketplace.seed";

export class DiscoveryService {
  constructor(private readonly store: MarketplaceStateStore) {}

  public getFeed(query: {
    tab?: string;
    q?: string;
    category?: string;
    condition?: string;
    maxDistanceKm?: number;
  }) {
    let list = this.store.items.filter((i) => i.status === "active");
    if (query.category && query.category !== "all") {
      list = list.filter((i) => i.categorySlug === query.category);
    }
    if (query.condition && query.condition !== "all") {
      list = list.filter((i) => i.condition === query.condition);
    }
    if (query.maxDistanceKm && query.maxDistanceKm > 0) {
      list = list.filter((i) => i.distanceKm <= query.maxDistanceKm!);
    }
    if (query.q && query.q.trim().length > 0) {
      const q = query.q.trim().toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.neighbourhood.toLowerCase().includes(q) ||
          i.wantsSummary.some((w) => w.toLowerCase().includes(q))
      );
    }

    if (query.tab === "nearby") list = [...list].sort((a, b) => a.distanceKm - b.distanceKm);
    else if (query.tab === "new") {
      list = [...list].sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    } else list = [...list].sort((a, b) => b.matchScore - a.matchScore);

    const items = list.map((i) => ({ ...i, savedByMe: this.store.savedItemIds.has(i.id) }));
    return { items, total: items.length };
  }

  public toggleSaveItem(id: string) {
    if (this.store.savedItemIds.has(id)) this.store.savedItemIds.delete(id);
    else this.store.savedItemIds.add(id);
    return {
      saved: this.store.savedItemIds.has(id),
      savedIds: Array.from(this.store.savedItemIds),
    };
  }
}
