import { Injectable, Logger } from '@nestjs/common';
import { BaseAdapter, DiscoveredDeal } from './base.adapter';

/**
 * CVS Deals Adapter
 * Note: CVS does not have a public API.
 * Integration pending official partnership or allowed data source.
 */
@Injectable()
export class CvsDealsAdapter extends BaseAdapter {
  readonly storeName = 'CVS';
  readonly storeSlug = 'cvs';
  private readonly logger = new Logger(CvsDealsAdapter.name);

  async isAvailable(): Promise<boolean> { return false; }

  async fetchDeals(): Promise<DiscoveredDeal[]> {
    this.logger.warn('CVS does not have a public API. No deals fetched.');
    return [];
  }
}
