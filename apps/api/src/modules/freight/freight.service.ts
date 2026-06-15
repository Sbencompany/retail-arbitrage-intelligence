import { Injectable, Logger } from '@nestjs/common';
import { UspsAdapter } from './adapters/usps.adapter';
import { UpsAdapter } from './adapters/ups.adapter';
import { FedexAdapter } from './adapters/fedex.adapter';

export interface ShippingRequest {
  originZip: string;
  destZip: string;
  weightLbs: number;
  weightOz?: number;
  lengthIn?: number;
  widthIn?: number;
  heightIn?: number;
}

export interface ShippingQuote {
  carrier: string;
  service: string;
  rate: number;
  estimatedDays: string;
  dimensionalWeight?: number;
  billableWeight?: number;
}

@Injectable()
export class FreightService {
  private readonly logger = new Logger(FreightService.name);

  constructor(
    private readonly usps: UspsAdapter,
    private readonly ups: UpsAdapter,
    private readonly fedex: FedexAdapter,
  ) {}

  async getQuotes(req: ShippingRequest): Promise<ShippingQuote[]> {
    const { weightLbs, lengthIn = 12, widthIn = 8, heightIn = 6 } = req;
    const dimWeight = this.calculateDimWeight(lengthIn, widthIn, heightIn);
    const billableWeight = Math.max(weightLbs, dimWeight);

    const results = await Promise.allSettled([
      this.usps.calculateRate({
        originZip: req.originZip, destZip: req.destZip,
        weightLbs, weightOz: req.weightOz ?? 0,
        lengthIn, widthIn, heightIn,
      }),
      this.ups.getRates({
        originZip: req.originZip, destZip: req.destZip,
        weightLbs, lengthIn, widthIn, heightIn,
      }),
      this.fedex.getRates({
        originZip: req.originZip, originState: 'NY',
        destZip: req.destZip, destState: 'CA',
        weightLbs, lengthIn, widthIn, heightIn,
      }),
    ]);

    const quotes: ShippingQuote[] = [];

    if (results[0].status === 'fulfilled') {
      for (const r of results[0].value) {
        quotes.push({ carrier: 'USPS', service: r.service, rate: r.rate, estimatedDays: r.days, billableWeight });
      }
    }
    if (results[1].status === 'fulfilled') {
      for (const r of results[1].value) {
        quotes.push({ carrier: 'UPS', service: r.service, rate: r.rate, estimatedDays: r.days, dimensionalWeight: dimWeight, billableWeight });
      }
    }
    if (results[2].status === 'fulfilled') {
      for (const r of results[2].value) {
        quotes.push({ carrier: 'FedEx', service: r.service, rate: r.rate, estimatedDays: r.days, dimensionalWeight: dimWeight, billableWeight });
      }
    }

    return quotes.sort((a, b) => a.rate - b.rate);
  }

  async getCheapestQuote(req: ShippingRequest): Promise<ShippingQuote | null> {
    const quotes = await this.getQuotes(req);
    return quotes.length > 0 ? quotes[0] : null;
  }

  calculateDimWeight(l: number, w: number, h: number, divisor = 139): number {
    return Math.round((l * w * h / divisor) * 100) / 100;
  }

  calculateBillableWeight(actualLbs: number, l: number, w: number, h: number): number {
    const dimWeight = this.calculateDimWeight(l, w, h);
    return Math.max(actualLbs, dimWeight);
  }

  estimateFbaShippingToWarehouse(weightLbs: number): number {
    // Amazon FBA inbound shipping estimate
    if (weightLbs <= 1) return 0.50;
    if (weightLbs <= 5) return 1.50;
    if (weightLbs <= 10) return 3.00;
    if (weightLbs <= 20) return 5.50;
    return 9.00;
  }
}
