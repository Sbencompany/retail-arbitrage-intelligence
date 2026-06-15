import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

/**
 * Best Buy Open API Adapter
 * Official Docs: https://bestbuyapis.github.io/api-documentation/
 * Registration: https://developer.bestbuy.com/
 * Auth: API Key (query param `apiKey`)
 * Rate limits: 5 req/sec, 50,000 req/day
 */
@Injectable()
export class BestBuyAdapter {
  private readonly logger = new Logger(BestBuyAdapter.name);
  private readonly client: AxiosInstance;
  private readonly apiKey: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = config.get('BESTBUY_API_KEY', '');
    this.client = axios.create({
      baseURL: 'https://api.bestbuy.com/v1',
      timeout: 15000,
    });
  }

  private get isConfigured(): boolean {
    return !!this.apiKey;
  }

  private async request<T>(path: string, params?: any): Promise<T> {
    if (!this.isConfigured) {
      throw new Error('Best Buy API key not configured. Please set BESTBUY_API_KEY in .env');
    }
    const resp = await this.client.get<T>(path, {
      params: { ...params, apiKey: this.apiKey, format: 'json' },
    });
    return resp.data;
  }

  /**
   * Search products on sale / clearance
   * Endpoint: GET /v1/products(filter)
   * Rate limit: 5 req/sec
   */
  async getClearanceItems(categoryId?: string): Promise<any> {
    const filter = categoryId
      ? `onSale=true&categoryPath.id=${categoryId}`
      : `onSale=true`;
    return this.request(`/products(${filter})`, {
      show: 'sku,name,salePrice,regularPrice,upc,categoryPath,image,url',
      pageSize: 100,
      sort: 'salePrice.asc',
    });
  }

  /**
   * Search products by keyword
   * Endpoint: GET /v1/products(search=keyword)
   */
  async searchProducts(keyword: string): Promise<any> {
    return this.request(`/products(search=${encodeURIComponent(keyword)})`, {
      show: 'sku,name,salePrice,regularPrice,upc,categoryPath,image,url,onSale',
      pageSize: 50,
    });
  }

  /**
   * Get product by SKU
   */
  async getProduct(sku: string): Promise<any> {
    return this.request(`/products/${sku}.json`);
  }

  /**
   * Get deals of the day
   */
  async getDailyDeals(): Promise<any> {
    return this.request('/products(deal=true)', {
      show: 'sku,name,salePrice,regularPrice,upc,percentSavings,categoryPath,image,url',
      pageSize: 100,
    });
  }
}
