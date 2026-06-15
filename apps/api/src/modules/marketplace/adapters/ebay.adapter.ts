import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

/**
 * eBay Browse API Adapter
 * Official Docs: https://developer.ebay.com/api-docs/buy/browse/overview.html
 * Auth: OAuth2 client credentials (application token for Browse API)
 * Rate limits: 5,000 req/day, 5 req/sec
 * Sandbox: https://api.sandbox.ebay.com
 */
@Injectable()
export class EbayAdapter {
  private readonly logger = new Logger(EbayAdapter.name);
  private readonly client: AxiosInstance;
  private readonly baseUrl: string;
  private appToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(private readonly config: ConfigService) {
    const sandbox = config.get('EBAY_SANDBOX') === 'true';
    this.baseUrl = sandbox ? 'https://api.sandbox.ebay.com' : 'https://api.ebay.com';
    this.client = axios.create({ baseURL: this.baseUrl, timeout: 15000 });
  }

  private async getAppToken(): Promise<string> {
    if (this.appToken && Date.now() < this.tokenExpiry) return this.appToken;

    const appId = this.config.get('EBAY_APP_ID');
    const certId = this.config.get('EBAY_CERT_ID');

    if (!appId || !certId) {
      throw new Error('eBay API credentials not configured. Please set EBAY_APP_ID, EBAY_CERT_ID in .env');
    }

    const credentials = Buffer.from(`${appId}:${certId}`).toString('base64');
    const resp = await axios.post(
      `${this.baseUrl}/identity/v1/oauth2/token`,
      'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    this.appToken = resp.data.access_token;
    this.tokenExpiry = Date.now() + (resp.data.expires_in - 60) * 1000;
    return this.appToken!;
  }

  private async request<T>(path: string, params?: any): Promise<T> {
    const token = await this.getAppToken();
    const resp = await this.client.get<T>(path, {
      params,
      headers: { 'Authorization': `Bearer ${token}`, 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US' },
    });
    return resp.data;
  }

  /**
   * Search items using Browse API
   * Endpoint: GET /buy/browse/v1/item_summary/search
   * Rate limit: 5 req/sec, 5000/day
   */
  async searchItems(query: string, options?: { limit?: number; sort?: string }): Promise<any> {
    return this.request('/buy/browse/v1/item_summary/search', {
      q: query,
      limit: options?.limit ?? 50,
      sort: options?.sort ?? 'price',
      filter: 'conditionIds:{1000}', // New condition
    });
  }

  /**
   * Get item details
   * Endpoint: GET /buy/browse/v1/item/{itemId}
   */
  async getItem(itemId: string): Promise<any> {
    return this.request(`/buy/browse/v1/item/${itemId}`);
  }

  /**
   * Search sold/completed listings for demand estimation
   * Endpoint: GET /buy/browse/v1/item_summary/search with filter
   */
  async getCompletedListings(query: string, limit = 50): Promise<any> {
    return this.request('/buy/browse/v1/item_summary/search', {
      q: query,
      limit,
      filter: 'buyingOptions:{FIXED_PRICE},conditionIds:{1000}',
    });
  }

  /**
   * Search by UPC
   */
  async searchByUpc(upc: string): Promise<any> {
    return this.request('/buy/browse/v1/item_summary/search', {
      gtin: upc,
      limit: 20,
    });
  }

  async isConfigured(): Promise<boolean> {
    return !!(this.config.get('EBAY_APP_ID') && this.config.get('EBAY_CERT_ID'));
  }
}
