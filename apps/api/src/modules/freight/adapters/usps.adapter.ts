import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as xml2js from 'xml2js';

/**
 * USPS Web Tools API Adapter
 * Official Docs: https://www.usps.com/business/web-tools-apis/
 * Registration: https://registration.shippingapis.com/
 * Auth: UserId query parameter (register to get one)
 * Rate limits: ~1,000 req/hour recommended
 * Endpoint: https://production.shippingapis.com/ShippingAPI.dll
 */
@Injectable()
export class UspsAdapter {
  private readonly logger = new Logger(UspsAdapter.name);
  private readonly endpoint: string;
  private readonly userId: string;

  constructor(private readonly config: ConfigService) {
    this.endpoint = config.get('USPS_API_ENDPOINT', 'https://production.shippingapis.com/ShippingAPI.dll');
    this.userId = config.get('USPS_USER_ID', '');
  }

  get isConfigured(): boolean {
    return !!this.userId;
  }

  /**
   * Calculate domestic shipping rate
   * API: RateV4
   */
  async calculateRate(params: {
    originZip: string;
    destZip: string;
    weightLbs: number;
    weightOz: number;
    lengthIn: number;
    widthIn: number;
    heightIn: number;
    service?: string;
  }): Promise<{ service: string; rate: number; days: string }[]> {
    if (!this.isConfigured) {
      this.logger.warn('USPS not configured, returning estimate');
      return [{ service: 'USPS Priority Mail (estimated)', rate: this.estimateRate(params.weightLbs), days: '2-3' }];
    }

    const xml = `<RateV4Request USERID="${this.userId}">
      <Revision>2</Revision>
      <Package ID="1ST">
        <Service>ALL</Service>
        <ZipOrigination>${params.originZip}</ZipOrigination>
        <ZipDestination>${params.destZip}</ZipDestination>
        <Pounds>${Math.floor(params.weightLbs)}</Pounds>
        <Ounces>${params.weightOz || 0}</Ounces>
        <Container>VARIABLE</Container>
        <Width>${params.widthIn}</Width>
        <Length>${params.lengthIn}</Length>
        <Height>${params.heightIn}</Height>
        <Machinable>True</Machinable>
      </Package>
    </RateV4Request>`;

    try {
      const resp = await axios.get(this.endpoint, {
        params: { API: 'RateV4', XML: xml },
        timeout: 10000,
      });

      const parsed = await xml2js.parseStringPromise(resp.data);
      const packages = parsed?.RateV4Response?.Package ?? [];
      const results: { service: string; rate: number; days: string }[] = [];

      for (const pkg of packages) {
        const postages = pkg.Postage ?? [];
        for (const p of postages) {
          results.push({
            service: p.MailService?.[0] ?? 'USPS',
            rate: parseFloat(p.Rate?.[0] ?? '0'),
            days: p.CommitmentDays?.[0] ?? p.Days?.[0] ?? 'N/A',
          });
        }
      }
      return results.filter(r => r.rate > 0).sort((a, b) => a.rate - b.rate);
    } catch (error) {
      this.logger.error('USPS API error: ' + error.message);
      return [{ service: 'USPS Priority Mail (estimated)', rate: this.estimateRate(params.weightLbs), days: '2-3' }];
    }
  }

  private estimateRate(weightLbs: number): number {
    if (weightLbs <= 1) return 8.50;
    if (weightLbs <= 2) return 10.00;
    if (weightLbs <= 5) return 14.00;
    if (weightLbs <= 10) return 20.00;
    return 28.00;
  }
}
