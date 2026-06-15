import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { BaseAdapter, DiscoveredDeal } from './base.adapter';

/**
 * Best Buy Deals Adapter
 * API Docs: https://bestbuyapis.github.io/api-documentation/
 * Rate limits: 5 req/sec, 50,000 req/day
 */
@Injectable()
export class BestBuyDealsAdapter extends BaseAdapter {
  readonly storeName = 'Best Buy';
  readonly storeSlug = 'bestbuy';
  private readonly logger = new Logger(BestBuyDealsAdapter.name);

  constructor(private readonly config: ConfigService) { super(); }

  async isAvailable(): Promise<boolean> {
    return !!this.config.get('BESTBUY_API_KEY');
  }

  async fetchDeals(): Promise<DiscoveredDeal[]> {
    const apiKey = this.config.get('BESTBUY_API_KEY');
    if (!apiKey) {
      this.logger.warn('Best Buy API key not configured');
      return this.getMockDeals();
    }

    try {
      const resp = await axios.get('https://api.bestbuy.com/v1/products(onSale=true)', {
        params: {
          apiKey,
          show: 'sku,name,salePrice,regularPrice,upc,categoryPath,image,url,onSale,percentSavings',
          pageSize: 100,
          sort: 'percentSavings.dsc',
          format: 'json',
        },
        timeout: 15000,
      });

      const products = resp.data?.products ?? [];
      return products.filter((p: any) => p.onSale && p.salePrice < p.regularPrice).map((p: any) => ({
        sku: String(p.sku),
        upc: p.upc,
        title: p.name,
        category: p.categoryPath?.map((c: any) => c.name).join(' > '),
        originalPrice: parseFloat(p.regularPrice ?? 0),
        salePrice: parseFloat(p.salePrice ?? 0),
        discountPercent: parseFloat(p.percentSavings ?? 0),
        inStock: true,
        url: p.url,
        imageUrl: p.image,
        dealType: 'SALE',
      }));
    } catch (error) {
      this.logger.error('Best Buy API error: ' + error.message);
      return this.getMockDeals();
    }
  }

  private getMockDeals(): DiscoveredDeal[] {
    return [
      { sku: 'BB001', upc: '616013700992', title: 'Amazon Echo Dot 4th Gen', category: 'Smart Home', originalPrice: 49.99, salePrice: 22.99, discountPercent: 54, inStock: true, dealType: 'SALE' },
      { sku: 'BB002', upc: '050000207428', title: 'Vitamix 5200 Blender', category: 'Kitchen', originalPrice: 449.99, salePrice: 299.99, discountPercent: 33, inStock: true, dealType: 'SALE' },
    ];
  }
}
