import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

/**
 * Amazon SP-API Adapter
 * Official Docs: https://developer-docs.amazon.com/sp-api/docs
 * Auth: LWA (Login With Amazon) OAuth2
 * Rate limits: Varies per endpoint (see docs per operation)
 * Sandbox: https://sandbox.sellingpartnerapi-na.amazon.com
 */
@Injectable()
export class AmazonSpAdapter {
  private readonly logger = new Logger(AmazonSpAdapter.name);
  private readonly client: AxiosInstance;
  private readonly lwaEndpoint: string;
  private readonly spEndpoint: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(private readonly config: ConfigService) {
    this.lwaEndpoint = config.get('AMAZON_LWA_ENDPOINT', 'https://api.amazon.com/auth/o2/token');
    this.spEndpoint = config.get('AMAZON_SP_ENDPOINT', 'https://sellingpartnerapi-na.amazon.com');
    this.client = axios.create({ baseURL: this.spEndpoint, timeout: 15000 });
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) return this.accessToken;

    const clientId = this.config.get('AMAZON_SP_CLIENT_ID');
    const clientSecret = this.config.get('AMAZON_SP_CLIENT_SECRET');
    const refreshToken = this.config.get('AMAZON_SP_REFRESH_TOKEN');

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error('Amazon SP-API credentials not configured. Please set AMAZON_SP_CLIENT_ID, AMAZON_SP_CLIENT_SECRET, AMAZON_SP_REFRESH_TOKEN in .env');
    }

    const resp = await axios.post(this.lwaEndpoint, {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

    this.accessToken = resp.data.access_token;
    this.tokenExpiry = Date.now() + (resp.data.expires_in - 60) * 1000;
    return this.accessToken!;
  }

  private async request<T>(method: string, path: string, params?: any): Promise<T> {
    const token = await this.getAccessToken();
    const resp = await this.client.request<T>({
      method,
      url: path,
      params,
      headers: { 'x-amz-access-token': token, 'x-amz-date': new Date().toISOString() },
    });
    return resp.data;
  }

  /**
   * Get catalog item by ASIN
   * Endpoint: GET /catalog/2022-04-01/items/{asin}
   * Rate limit: 2 req/sec
   */
  async getCatalogItem(asin: string): Promise<any> {
    const marketplaceId = this.config.get('AMAZON_SP_MARKETPLACE_ID', 'ATVPDKIKX0DER');
    return this.request('GET', `/catalog/2022-04-01/items/${asin}`, {
      marketplaceIds: marketplaceId,
      includedData: 'summaries,attributes,salesRanks,images',
    });
  }

  /**
   * Get competitive pricing for ASINs
   * Endpoint: POST /batches/products/pricing/2022-05-01/items/competitiveSummary
   * Rate limit: 0.5 req/sec
   */
  async getCompetitivePricing(asins: string[]): Promise<any> {
    const marketplaceId = this.config.get('AMAZON_SP_MARKETPLACE_ID', 'ATVPDKIKX0DER');
    return this.request('POST', '/batches/products/pricing/2022-05-01/items/competitiveSummary', {
      requests: asins.map(asin => ({
        uri: `/products/pricing/2022-05-01/items/${asin}/competitiveSummary`,
        method: 'GET',
        queryParams: { marketplaceId, includedData: 'featuredBuyingOption,lowestPricedOffers' },
      })),
    });
  }

  /**
   * Get product fees estimate
   * Endpoint: POST /products/fees/v0/feesEstimate
   * Rate limit: 0.5 req/sec
   */
  async getFeesEstimate(asin: string, price: number): Promise<any> {
    const marketplaceId = this.config.get('AMAZON_SP_MARKETPLACE_ID', 'ATVPDKIKX0DER');
    return this.request('POST', '/products/fees/v0/feesEstimate', {
      FeesEstimateRequest: {
        MarketplaceId: marketplaceId,
        Identifier: asin,
        IsAmazonFulfilled: true,
        PriceToEstimateFees: { ListingPrice: { Amount: price, CurrencyCode: 'USD' } },
      },
    });
  }

  /**
   * Search catalog items by keywords or UPC
   * Endpoint: GET /catalog/2022-04-01/items
   * Rate limit: 2 req/sec
   */
  async searchItems(query: string, identifiers?: string[]): Promise<any> {
    const marketplaceId = this.config.get('AMAZON_SP_MARKETPLACE_ID', 'ATVPDKIKX0DER');
    const params: any = {
      marketplaceIds: marketplaceId,
      includedData: 'summaries,identifiers,images,salesRanks',
      pageSize: 20,
    };
    if (identifiers?.length) {
      params.identifiers = identifiers.join(',');
      params.identifiersType = 'UPC';
    } else {
      params.keywords = query;
    }
    return this.request('GET', '/catalog/2022-04-01/items', params);
  }

  async isConfigured(): Promise<boolean> {
    return !!(
      this.config.get('AMAZON_SP_CLIENT_ID') &&
      this.config.get('AMAZON_SP_CLIENT_SECRET') &&
      this.config.get('AMAZON_SP_REFRESH_TOKEN')
    );
  }
}
