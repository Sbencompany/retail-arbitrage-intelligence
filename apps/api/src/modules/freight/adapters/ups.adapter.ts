import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

/**
 * UPS API Adapter (REST as of 2024)
 * Official Docs: https://developer.ups.com/api/reference
 * Registration: https://developer.ups.com/
 * Auth: OAuth2 client credentials
 * Rate limits: 200 req/min
 */
@Injectable()
export class UpsAdapter {
  private readonly logger = new Logger(UpsAdapter.name);
  private readonly client: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(private readonly config: ConfigService) {
    this.client = axios.create({
      baseURL: config.get('UPS_API_ENDPOINT', 'https://onlinetools.ups.com'),
      timeout: 15000,
    });
  }

  get isConfigured(): boolean {
    return !!(this.config.get('UPS_CLIENT_ID') && this.config.get('UPS_CLIENT_SECRET'));
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) return this.accessToken;
    if (!this.isConfigured) throw new Error('UPS credentials not configured');

    const clientId = this.config.get('UPS_CLIENT_ID');
    const clientSecret = this.config.get('UPS_CLIENT_SECRET');
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const resp = await axios.post(
      `${this.config.get('UPS_API_ENDPOINT', 'https://onlinetools.ups.com')}/security/v1/oauth/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-merchant-id': this.config.get('UPS_ACCOUNT_NUMBER', ''),
        },
      }
    );

    this.accessToken = resp.data.access_token;
    this.tokenExpiry = Date.now() + (resp.data.expires_in - 60) * 1000;
    return this.accessToken!;
  }

  /**
   * Get shipping rate via UPS Rating API
   * Endpoint: POST /api/rating/v2403/Shop
   */
  async getRates(params: {
    originZip: string; originCountry?: string;
    destZip: string; destCountry?: string;
    weightLbs: number;
    lengthIn?: number; widthIn?: number; heightIn?: number;
  }): Promise<{ service: string; rate: number; days: string }[]> {
    if (!this.isConfigured) {
      return [{ service: 'UPS Ground (estimated)', rate: this.estimateRate(params.weightLbs), days: '3-5' }];
    }

    try {
      const token = await this.getAccessToken();
      const billableWeight = this.getBillableWeight(params.weightLbs, params.lengthIn, params.widthIn, params.heightIn);

      const body = {
        RateRequest: {
          Shipment: {
            Shipper: { ShipperNumber: this.config.get('UPS_ACCOUNT_NUMBER', ''), Address: { PostalCode: params.originZip, CountryCode: params.originCountry ?? 'US' } },
            ShipTo: { Address: { PostalCode: params.destZip, CountryCode: params.destCountry ?? 'US' } },
            ShipFrom: { Address: { PostalCode: params.originZip, CountryCode: params.originCountry ?? 'US' } },
            Package: {
              PackagingType: { Code: '02' }, // Customer supplied
              PackageWeight: { UnitOfMeasurement: { Code: 'LBS' }, Weight: billableWeight.toString() },
              Dimensions: params.lengthIn ? {
                UnitOfMeasurement: { Code: 'IN' },
                Length: (params.lengthIn ?? 12).toString(),
                Width: (params.widthIn ?? 8).toString(),
                Height: (params.heightIn ?? 6).toString(),
              } : undefined,
            },
          },
        },
      };

      const resp = await this.client.post('/api/rating/v2403/Shop', body, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      const services = resp.data?.RateResponse?.RatedShipment ?? [];
      return services.map((s: any) => ({
        service: `UPS ${s.Service?.Description ?? s.Service?.Code ?? 'Unknown'}`,
        rate: parseFloat(s.TotalCharges?.MonetaryValue ?? '0'),
        days: s.GuaranteedDelivery?.BusinessDaysInTransit ?? s.TimeInTransit?.PickupDayCount ?? 'N/A',
      })).filter((s: any) => s.rate > 0).sort((a: any, b: any) => a.rate - b.rate);
    } catch (error) {
      this.logger.error('UPS API error: ' + error.message);
      return [{ service: 'UPS Ground (estimated)', rate: this.estimateRate(params.weightLbs), days: '3-5' }];
    }
  }

  private getBillableWeight(actualLbs: number, l = 12, w = 8, h = 6): number {
    const dimWeight = (l * w * h) / 139;
    return Math.max(actualLbs, dimWeight);
  }

  private estimateRate(weightLbs: number): number {
    if (weightLbs <= 1) return 9.50;
    if (weightLbs <= 5) return 14.00;
    if (weightLbs <= 10) return 19.00;
    if (weightLbs <= 20) return 27.00;
    return 38.00;
  }
}
