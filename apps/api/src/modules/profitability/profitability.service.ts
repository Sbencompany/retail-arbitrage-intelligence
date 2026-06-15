import { Injectable, Logger } from '@nestjs/common';

export interface ProfitabilityInput {
  purchasePrice: number;
  salePrice: number;
  marketplace: 'AMAZON' | 'WALMART' | 'EBAY';
  fulfillmentMethod: 'FBA' | 'FBM' | 'WALMART_WFS' | 'EBAY_STANDARD';
  weightLbs: number;
  lengthIn?: number;
  widthIn?: number;
  heightIn?: number;
  category?: string;
  shippingCostEstimate?: number;
  monthlyStorageDays?: number;
}

export interface ProfitabilityResult {
  purchasePrice: number;
  salePrice: number;
  referralFee: number;
  fulfillmentFee: number;
  storageFee: number;
  shippingCost: number;
  packagingCost: number;
  totalCost: number;
  grossRevenue: number;
  grossProfit: number;
  netProfit: number;
  roi: number;
  margin: number;
  breakEvenPrice: number;
  isViable: boolean;
  details: Record<string, number>;
}

@Injectable()
export class ProfitabilityService {
  private readonly logger = new Logger(ProfitabilityService.name);

  // Amazon referral fee rates by category (as of 2024)
  // Source: https://sell.amazon.com/fees
  private readonly amazonReferralFees: Record<string, number> = {
    'Automotive': 0.12,
    'Baby Products': 0.08,
    'Beauty': 0.08,
    'Books': 0.15,
    'Camera & Photo': 0.08,
    'Cell Phone Accessories': 0.45,
    'Electronics': 0.08,
    'Grocery & Gourmet': 0.08,
    'Health & Personal Care': 0.08,
    'Home & Garden': 0.15,
    'Home Appliances': 0.15,
    'Kitchen Appliances': 0.15,
    'Jewelry': 0.20,
    'Luggage': 0.15,
    'Musical Instruments': 0.12,
    'Office Products': 0.15,
    'Pet Supplies': 0.15,
    'Shoes': 0.15,
    'Sporting Goods': 0.15,
    'Toys & Games': 0.15,
    'Video Games': 0.15,
    'default': 0.15,
  };

  calculate(input: ProfitabilityInput): ProfitabilityResult {
    const {
      purchasePrice, salePrice, marketplace, fulfillmentMethod,
      weightLbs, lengthIn = 12, widthIn = 8, heightIn = 6,
      category = 'default', shippingCostEstimate = 0, monthlyStorageDays = 30,
    } = input;

    let referralFee = 0;
    let fulfillmentFee = 0;
    let storageFee = 0;
    let shippingCost = 0;
    let packagingCost = 0;

    if (marketplace === 'AMAZON') {
      const rate = this.amazonReferralFees[category] ?? this.amazonReferralFees['default'];
      referralFee = Math.max(salePrice * rate, 0.30); // min $0.30

      if (fulfillmentMethod === 'FBA') {
        // FBA fees based on size tier (2024 rates)
        fulfillmentFee = this.calculateFbaFulfillmentFee(weightLbs, lengthIn, widthIn, heightIn);
        // Monthly storage fee: $0.78/cubic ft (Jan-Sep), $2.40 (Oct-Dec)
        const cubicFt = (lengthIn * widthIn * heightIn) / 1728;
        storageFee = cubicFt * 0.78 * (monthlyStorageDays / 30);
        packagingCost = 0; // FBA handles it
      } else {
        // FBM
        shippingCost = shippingCostEstimate > 0 ? shippingCostEstimate : this.estimateFbmShipping(weightLbs);
        packagingCost = 1.50; // estimated packaging
      }
    } else if (marketplace === 'WALMART') {
      // Walmart Marketplace: 6-20% referral fee
      referralFee = salePrice * 0.15; // average 15%
      shippingCost = shippingCostEstimate > 0 ? shippingCostEstimate : this.estimateFbmShipping(weightLbs);
      packagingCost = 1.50;
    } else if (marketplace === 'EBAY') {
      // eBay Final Value Fee: 12.9% + $0.30 for most categories
      referralFee = (salePrice * 0.129) + 0.30;
      // Promoted listings: ~2% optional
      fulfillmentFee = salePrice * 0.02; // promoted listings
      shippingCost = shippingCostEstimate > 0 ? shippingCostEstimate : this.estimateFbmShipping(weightLbs);
      packagingCost = 1.50;
    }

    const totalFees = referralFee + fulfillmentFee + storageFee;
    const totalCost = purchasePrice + totalFees + shippingCost + packagingCost;
    const grossRevenue = salePrice;
    const grossProfit = grossRevenue - purchasePrice;
    const netProfit = grossRevenue - totalCost;
    const roi = purchasePrice > 0 ? (netProfit / purchasePrice) * 100 : 0;
    const margin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;
    const breakEvenPrice = totalCost / (1 - (this.amazonReferralFees[category] ?? 0.15));

    return {
      purchasePrice,
      salePrice,
      referralFee: Math.round(referralFee * 100) / 100,
      fulfillmentFee: Math.round(fulfillmentFee * 100) / 100,
      storageFee: Math.round(storageFee * 100) / 100,
      shippingCost: Math.round(shippingCost * 100) / 100,
      packagingCost: Math.round(packagingCost * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      grossRevenue: Math.round(grossRevenue * 100) / 100,
      grossProfit: Math.round(grossProfit * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      roi: Math.round(roi * 100) / 100,
      margin: Math.round(margin * 100) / 100,
      breakEvenPrice: Math.round(breakEvenPrice * 100) / 100,
      isViable: roi >= 20 && netProfit >= 3,
      details: {
        totalFees: Math.round(totalFees * 100) / 100,
        feePercentage: Math.round((totalFees / salePrice) * 10000) / 100,
      },
    };
  }

  private calculateFbaFulfillmentFee(weightLbs: number, l: number, w: number, h: number): number {
    const girth = 2 * (w + h);
    const longestSide = Math.max(l, w, h);
    const medianSide = [l, w, h].sort((a, b) => a - b)[1];
    const shortestSide = Math.min(l, w, h);
    const dimWeight = (l * w * h) / 139;
    const billableWeight = Math.max(weightLbs, dimWeight);

    // Small Standard (≤ 0.75 lb, ≤ 15"x12"x0.75")
    if (weightLbs <= 0.75 && longestSide <= 15 && medianSide <= 12 && shortestSide <= 0.75) {
      return weightLbs <= 0.25 ? 3.22 : 3.40;
    }
    // Large Standard
    if (longestSide <= 18 && medianSide <= 14 && shortestSide <= 8 && weightLbs <= 20) {
      if (billableWeight <= 1) return 3.58;
      if (billableWeight <= 2) return 4.76;
      if (billableWeight <= 3) return 5.26;
      if (billableWeight <= 21) return 5.26 + (Math.ceil(billableWeight) - 3) * 0.38;
    }
    // Large Bulky
    if (longestSide <= 59 && medianSide <= 33 && shortestSide <= 33 && billableWeight <= 50) {
      return 9.73 + Math.max(0, billableWeight - 1) * 0.42;
    }
    // Extra Large / Default
    return 26.33 + Math.max(0, billableWeight - 90) * 0.83;
  }

  private estimateFbmShipping(weightLbs: number): number {
    if (weightLbs <= 1) return 4.50;
    if (weightLbs <= 5) return 7.50;
    if (weightLbs <= 10) return 12.00;
    if (weightLbs <= 20) return 18.00;
    return 28.00;
  }

  calculateBatch(inputs: ProfitabilityInput[]): ProfitabilityResult[] {
    return inputs.map(input => this.calculate(input));
  }

  findBestMarketplace(purchasePrice: number, weightLbs: number, category: string, amazonPrice: number, walmartPrice: number, ebayPrice: number) {
    const results = [
      { marketplace: 'AMAZON', method: 'FBA', price: amazonPrice },
      { marketplace: 'AMAZON', method: 'FBM', price: amazonPrice },
      { marketplace: 'WALMART', method: 'WALMART_WFS', price: walmartPrice },
      { marketplace: 'EBAY', method: 'EBAY_STANDARD', price: ebayPrice },
    ].filter(r => r.price > 0).map(r => ({
      ...r,
      result: this.calculate({
        purchasePrice,
        salePrice: r.price,
        marketplace: r.marketplace as any,
        fulfillmentMethod: r.method as any,
        weightLbs,
        category,
      }),
    }));

    return results.sort((a, b) => b.result.netProfit - a.result.netProfit);
  }
}
