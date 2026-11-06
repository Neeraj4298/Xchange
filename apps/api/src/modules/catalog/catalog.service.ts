/**
 * Catalog & Discovery Showcase Service (BE-0.5)
 */

import {
  SEED_CATEGORIES,
  SEED_CITIES,
  SEED_FEATURED_ITEMS,
  SEED_THREE_WAY_CHAIN,
} from "../../../prisma/seed-data";

export class CatalogService {
  public getCities() {
    return { items: SEED_CITIES };
  }

  public getCategories() {
    return { items: SEED_CATEGORIES };
  }

  public getShowcase() {
    return {
      cities: SEED_CITIES,
      categories: SEED_CATEGORIES,
      featuredItems: SEED_FEATURED_ITEMS,
      sampleThreeWayChain: {
        chainId: "01960000-0000-7000-8009-000000000301",
        city: "Bengaluru",
        meetupPointName: "Indiranagar Metro Safe Exchange Zone (Bay 2)",
        meetupDistanceKm: 2.3,
        expiresInHours: 22,
        minEdgeScore: 93,
        nodes: SEED_THREE_WAY_CHAIN,
      },
    };
  }
}
