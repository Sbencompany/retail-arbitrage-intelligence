import { Injectable, Logger } from '@nestjs/common';
import { BaseAdapter, DiscoveredDeal } from './base.adapter';

/**
 * Target Deals Adapter
 * Note: Target does not have a public API for non-partners.
 * Target RedCard/API access requires partnership program.
 * This adapter returns seed data and can be extended with approved access.
 * Terms: https://www.target.com/c/general-terms-conditions/-/N-4sr7l
 */
@Injectable()
export class TargetDealsAdapter extends BaseAdapter {
  readonly storeName = 'Target';
  readonly storeSlug = 'target';
  private readonly logger = new Logger(TargetDealsAdapter.name);

  async isAvailable(): Promise<boolean> {
    // Target requires partnership - returning false until integrated
    return false;
  }

  async fetchDeals(): Promise<DiscoveredDeal[]> {
    this.logger.warn('Target API requires partnership. Using representative sample data.');
    // Representative clearance data structure
    return [
      { sku: 'T001', title: 'Target Clearance Toy Bundle', category: 'Toys', originalPrice: 34.99, salePrice: 10.49, discountPercent: 70, inStock: true, dealType: 'CLEARANCE' },
      { sku: 'T002', title: 'Target Kitchen Appliance Sale', category: 'Kitchen', originalPrice: 59.99, salePrice: 29.99, discountPercent: 50, inStock: true, dealType: 'CLEARANCE' },
    ];
  }
}
