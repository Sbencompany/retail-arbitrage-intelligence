import { Injectable, Logger } from '@nestjs/common';
import { BaseAdapter, DiscoveredDeal } from './base.adapter';

/**
 * Kohl's Deals Adapter
 * Note: Kohl's does not have a public API for third parties.
 */
@Injectable()
export class KohlsDealsAdapter extends BaseAdapter {
  readonly storeName = "Kohl's";
  readonly storeSlug = 'kohls';
  private readonly logger = new Logger(KohlsDealsAdapter.name);

  async isAvailable(): Promise<boolean> { return false; }

  async fetchDeals(): Promise<DiscoveredDeal[]> {
    this.logger.warn("Kohl's does not have a public API. No deals fetched.");
    return [];
  }
}
