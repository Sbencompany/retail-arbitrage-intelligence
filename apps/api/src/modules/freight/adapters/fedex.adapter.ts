import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

/**
 * FedEx REST API Adapter
 * Official Docs: https://developer.fedex.com/api/en-us/home.html
 * Registration: https://developer.fedex.com/api/en-us/get-started.html
 * Auth: OAuth2 client credentials
 * Rate limits: 100 req/min production
 */
@Injectable()
export class FedexAdapter {
  private readonly logger = new Logger(FedexAdapter.name);
  private readonly client: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(private readonly config: ConfigService) {
    this.client = axios.create({
      baseURL: config.get('FEDEX_API_ENDPOINT', 'https://apis.fedex.com'),
      timeout: 15000,
    });
  }

  get isConfigured(): boolean {
    return !!(this.config.get('FEDEX_API_KEY') && this.config.get('FEDEX_SECRET_KEY'));
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) return this.accessToken;
    if (!this.isConfigured) throw new Error('FedEx credentials not configured');

    const resp = await this.client.post('/oauth/token', null, {
      params: {
        grant_type: 'client_credentials',
        client_id: this.config.get('FEDEX_API_KEY'),
        client_secret: this.config.get('FEDEX_SECRET_KEY'),
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    this.accessToken = resp.data.access_token;
    this.tokenExpiry = Date.now() + (resp.data.expires_in - 60) * 1000;
    return this.accessToken!;
  }

  /**
   * Get rate quotes
   * Endpoint: POST /rate/v1/rates/quotes
   */
  async getRates(params: {
    originZip: string; originState: string;
    destZip: string; destState: string;
    weightLbs: number;
    lengthIn?: number; widthIn?: number; heightIn?: number;
  }): Promise<{ service: string; rate: number; days: string }[]> {
    if (!this.isConfigured) {
      return [{ service: 'FedEx Ground (estimated)', rate: this.estimateRate(params.weightLbs), days: '3-5' }];
    }

    try {
      const token = await this.getAccessToken();
      const body = {
        accountNumber: { value: this.config.get('FEDEX_ACCOUNT_NUMBER') },
        requestedShipment: {
          shipper: { address: { postalCode: params.originZip, stateOrProvinceCode: params.originState, countryCode: 'US' } },
          recipient: { address: { postalCode: params.destZip, stateOrProvinceCode: params.destState, countryCode: 'US', residential: true } },
          pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
          rateRequestType: ['ACCOUNT', 'LIST'],
          requestedPackageLineItems: [{
            weight: { units: 'LB', value: params.weightLbs },
            dimensions: params.lengthIn ? {
              length: params.lengthIn ?? 12,
              width: params.widthIn ?? 8,
              height: params.heightIn ?? 6,
              units: 'IN',
            } : undefined,
          }],
        },
      };

      const resp = await this.client.post('/rate/v1/rates/quotes', body, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'X-locale': 'en_US' },
      });

      const rateDetails = resp.data?.output?.rateReplyDetails ?? [];
      return rateDetails.map((r: any) => {
        const netCharge = r.ratedShipmentDetails?.[0]?.totalNetCharge ?? 0;
        const commitDate = r.commit?.dateDetail?.dayFormat ?? 'N/A';
        return {
          service: r.serviceType ?? 'FedEx Service',
          rate: parseFloat(netCharge),
          days: commitDate,
        };
      }).filter((r: any) => r.rate > 0).sort((a: any, b: any) => a.rate - b.rate);
    } catch (error) {
      this.logger.error('FedEx API error: ' + error.message);
      return [{ service: 'FedEx Ground (estimated)', rate: this.estimateRate(params.weightLbs), days: '3-5' }];
    }
  }

  private estimateRate(weightLbs: number): number {
    if (weightLbs <= 1) return 10.00;
    if (weightLbs <= 5) return 15.00;
    if (weightLbs <= 10) return 21.00;
    if (weightLbs <= 20) return 30.00;
    return 42.00;
  }
}
