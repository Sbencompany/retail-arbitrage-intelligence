import { Injectable, Logger } from '@nestjs/common';
import { BaseAdapter, DiscoveredDeal } from './base.adapter';

/**
 * Walgreens Deals Adapter
 * Note: Walgreens does not have a public API for third parties.
 */
@Injectable()
export class WalgreensDealsAdapter extends BaseAdapter {
  readonly storeName = 'Walgreens';
  readonly storeSlug = 'walgreens';
  private readonly logger = new Logger(WalgreensDealsAdapter.name);

  async isAvailable(): Promise<boolean> { return false; }

  async fetchDeals(): Promise<DiscoveredDeal[]> {
    this.logger.warn('Walgreens does not have a public API. No deals fetched.');
    return [];
  }
}
