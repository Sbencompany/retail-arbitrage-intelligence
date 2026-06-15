import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { BaseAdapter, DiscoveredDeal } from './base.adapter';

/**
 * Walmart Deal Adapter
 * Uses Walmart Open API for clearance/sale items
 * Terms: https://developer.walmart.com/terms-of-service
 * API requires registration and credentials
 */
@Injectable()
export class WalmartDealsAdapter extends BaseAdapter {
  readonly storeName = 'Walmart';
  readonly storeSlug = 'walmart';
  private readonly logger = new Logger(WalmartDealsAdapter.name);

  private accessToken: string | null = null;
  private tokenExpiry = 0;

  constructor(private readonly config: ConfigService) {
    super();
  }

  async isAvailable(): Promise<boolean> {
    return !!(this.config.get('WALMART_CLIENT_ID') && this.config.get('WALMART_CLIENT_SECRET'));
  }

  private async getToken(): Promise<string | null> {
    if (this.accessToken && Date.now() < this.tokenExpiry) return this.accessToken;
    const id = this.config.get('WALMART_CLIENT_ID');
    const secret = this.config.get('WALMART_CLIENT_SECRET');
    if (!id || !secret) return null;

    try {
      const creds = Buffer.from(`${id}:${secret}`).toString('base64');
      const resp = await axios.post(
        'https://marketplace.walmartapis.com/v3/token',
        'grant_type=client_credentials',
        { headers: { 'Authorization': `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded', 'WM_SVC.NAME': 'RAI', 'WM_QOS.CORRELATION_ID': Date.now().toString() } }
      );
      this.accessToken = resp.data.access_token;
      this.tokenExpiry = Date.now() + (resp.data.expires_in - 60) * 1000;
      return this.accessToken;
    } catch { return null; }
  }

  async fetchDeals(): Promise<DiscoveredDeal[]> {
    const token = await this.getToken();
    if (!token) {
      this.logger.warn('Walmart API not configured - returning mock data for development');
      return this.getMockDeals();
    }

    try {
      const resp = await axios.get('https://marketplace.walmartapis.com/v3/items/walmart/search', {
        params: { specialOffer: 'clearance', numItems: 100, format: 'json' },
        headers: {
          'Authorization': `Bearer ${token}`,
          'WM_SVC.NAME': 'RAI',
          'WM_QOS.CORRELATION_ID': Date.now().toString(),
          'Accept': 'application/json',
        },
        timeout: 15000,
      });

      const items = resp.data?.items ?? [];
      return items.filter((i: any) => i.salePrice && i.msrp && i.salePrice < i.msrp).map((item: any) => ({
        sku: String(item.itemId),
        upc: item.upc,
        title: item.name,
        brand: item.brandName,
        category: item.categoryPath,
        originalPrice: parseFloat(item.msrp ?? item.salePrice ?? 0),
        salePrice: parseFloat(item.salePrice ?? 0),
        discountPercent: item.msrp ? Math.round(((item.msrp - item.salePrice) / item.msrp) * 100) : 0,
        inStock: item.availabilityStatus === 'IN_STOCK',
        url: item.productUrl,
        imageUrl: item.largeImage,
        dealType: 'CLEARANCE',
      }));
    } catch (error) {
      this.logger.error('Walmart API error: ' + error.message);
      return this.getMockDeals();
    }
  }

  private getMockDeals(): DiscoveredDeal[] {
    return [
      { sku: 'W001', upc: '885370481693', title: 'Instant Pot Duo 6Qt', brand: 'Instant Pot', category: 'Kitchen', originalPrice: 79.99, salePrice: 39.99, discountPercent: 50, inStock: true, dealType: 'CLEARANCE' },
      { sku: 'W002', upc: '043396574151', title: 'Sony WH-1000XM4 Headphones', brand: 'Sony', category: 'Electronics', originalPrice: 349.99, salePrice: 199.99, discountPercent: 43, inStock: true, dealType: 'CLEARANCE' },
      { sku: 'W003', upc: '801314628200', title: 'iRobot Roomba i3+', brand: 'iRobot', category: 'Home', originalPrice: 499.99, salePrice: 249.99, discountPercent: 50, inStock: true, dealType: 'SALE' },
    ];
  }
}
