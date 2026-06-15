export interface DiscoveredDeal {
  sku?: string;
  upc?: string;
  ean?: string;
  title: string;
  brand?: string;
  category?: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  inStock: boolean;
  url?: string;
  imageUrl?: string;
  weight?: number;
  dealType?: string;
  storeLocations?: string[];
}

export abstract class BaseAdapter {
  abstract fetchDeals(): Promise<DiscoveredDeal[]>;
  abstract isAvailable(): Promise<boolean>;
  abstract readonly storeName: string;
  abstract readonly storeSlug: string;
}
