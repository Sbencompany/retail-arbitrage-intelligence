import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

/**
 * Walmart Open API Adapter
 * Official Docs: https://developer.walmart.com/api/us/mp/items
 * Auth: OAuth2 client credentials
 * Rate limits: 200 req/min (affiliate), varies for marketplace
 * Base URL: https://marketplace.walmartapis.com/v3
 */
@Injectable()
export class WalmartAdapter {
  private readonly logger = new Logger(WalmartAdapter.name);
  private readonly client: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(private readonly config: ConfigService) {
    this.client = axios.create({
      baseURL: 'https://marketplace.walmartapis.com/v3',
      timeout: 15000,
    });
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) return this.accessToken;

    const clientId = this.config.get('WALMART_CLIENT_ID');
    const clientSecret = this.config.get('WALMART_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('Walmart API credentials not configured. Please set WALMART_CLIENT_ID, WALMART_CLIENT_SECRET in .env');
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const resp = await axios.post(
      'https://marketplace.walmartapis.com/v3/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'WM_SVC.NAME': 'Walmart Marketplace',
          'WM_QOS.CORRELATION_ID': Date.now().toString(),
        },
      }
    );

    this.accessToken = resp.data.access_token;
    this.tokenExpiry = Date.now() + (resp.data.expires_in - 60) * 1000;
    return this.accessToken!;
  }

  private async request<T>(method: string, path: string, params?: any): Promise<T> {
    const token = await this.getAccessToken();
    const resp = await this.client.request<T>({
      method, url: path, params,
      headers: {
        'Authorization': `Bearer ${token}`,
        'WM_SEC.ACCESS_TOKEN': token,
        'WM_QOS.CORRELATION_ID': Date.now().toString(),
        'WM_SVC.NAME': 'Walmart Marketplace',
        'Accept': 'application/json',
      },
    });
    return resp.data;
  }

  /**
   * Search items on Walmart
   * Endpoint: GET /v3/items/walmart/search
   */
  async searchItems(query: string): Promise<any> {
    return this.request('GET', '/items/walmart/search', { query, numItems: 25 });
  }

  /**
   * Get item details by ID
   */
  async getItem(itemId: string): Promise<any> {
    return this.request('GET', `/items/${itemId}`);
  }

  /**
   * Get clearance/sale items - Walmart Open API affiliate
   * Docs: https://developer.walmart.com/api/us/affiliate/browse
   */
  async getClearanceItems(categoryId?: string): Promise<any> {
    const params: any = { specialOffer: 'clearance', numItems: 100 };
    if (categoryId) params.categoryId = categoryId;
    return this.request('GET', '/items/walmart/search', params);
  }

  async isConfigured(): Promise<boolean> {
    return !!(this.config.get('WALMART_CLIENT_ID') && this.config.get('WALMART_CLIENT_SECRET'));
  }
}
