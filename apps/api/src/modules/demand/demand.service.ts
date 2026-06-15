import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface DemandEstimate {
  marketplace: string;
  bsr?: number;
  bsrCategory?: string;
  estimatedMonthlySales: number;
  demandScore: number;
  competitionLevel: 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  confidenceScore: number;
  sellThroughRate?: number;
  reasoning: string;
}

@Injectable()
export class DemandService {
  private readonly logger = new Logger(DemandService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Estimate monthly sales from Amazon BSR
   * Based on Jungle Scout BSR methodology (approximate)
   * Higher BSR = lower sales
   */
  estimateSalesFromBsr(bsr: number, category: string): number {
    // Sales estimation by BSR range (approximate, varies by category)
    const categoryMultipliers: Record<string, number> = {
      'Books': 3.0,
      'Toys & Games': 2.0,
      'Home & Kitchen': 1.5,
      'Electronics': 1.2,
      'Health & Personal Care': 1.3,
      'Sports & Outdoors': 1.0,
      'default': 1.0,
    };

    const mult = categoryMultipliers[category] ?? categoryMultipliers['default'];

    // Base formula: inverse relationship with BSR
    if (bsr <= 100) return Math.round(3000 * mult);
    if (bsr <= 500) return Math.round(1500 * mult);
    if (bsr <= 1000) return Math.round(800 * mult);
    if (bsr <= 5000) return Math.round(400 * mult);
    if (bsr <= 10000) return Math.round(200 * mult);
    if (bsr <= 50000) return Math.round(100 * mult);
    if (bsr <= 100000) return Math.round(50 * mult);
    if (bsr <= 500000) return Math.round(20 * mult);
    return Math.round(5 * mult);
  }

  /**
   * Calculate demand score (0-100) from various signals
   */
  calculateDemandScore(params: {
    bsr?: number;
    estimatedMonthlySales?: number;
    reviewCount?: number;
    rating?: number;
    totalSellers?: number;
    soldLast30Days?: number;
  }): number {
    let score = 50; // baseline

    // BSR score (lower BSR = higher demand)
    if (params.bsr) {
      if (params.bsr <= 1000)    score += 30;
      else if (params.bsr <= 10000)  score += 20;
      else if (params.bsr <= 50000)  score += 10;
      else if (params.bsr <= 100000) score += 5;
      else if (params.bsr > 500000)  score -= 20;
    }

    // Monthly sales
    if (params.estimatedMonthlySales) {
      if (params.estimatedMonthlySales >= 500)  score += 20;
      else if (params.estimatedMonthlySales >= 200) score += 10;
      else if (params.estimatedMonthlySales >= 50)  score += 5;
      else if (params.estimatedMonthlySales < 10)   score -= 15;
    }

    // Review signals (high reviews = proven demand)
    if (params.reviewCount) {
      if (params.reviewCount >= 1000) score += 10;
      else if (params.reviewCount >= 100) score += 5;
      else if (params.reviewCount < 10) score -= 5;
    }

    // Rating
    if (params.rating) {
      if (params.rating >= 4.5) score += 5;
      else if (params.rating < 3.5) score -= 10;
    }

    // eBay sold listings
    if (params.soldLast30Days) {
      if (params.soldLast30Days >= 100) score += 15;
      else if (params.soldLast30Days >= 30) score += 8;
      else if (params.soldLast30Days >= 10) score += 3;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate competition level from seller count
   */
  assessCompetition(totalSellers: number, fbaSellerCount: number): 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' {
    if (totalSellers === 0) return 'VERY_LOW';
    if (totalSellers <= 2) return 'LOW';
    if (totalSellers <= 10) return 'MEDIUM';
    if (totalSellers <= 25) return 'HIGH';
    return 'VERY_HIGH';
  }

  /**
   * Calculate sell-through rate for eBay
   * sellThroughRate = soldItems / totalListings (last 30 days)
   */
  calculateSellThroughRate(soldItems: number, totalListings: number): number {
    if (totalListings === 0) return 0;
    return Math.round((soldItems / totalListings) * 10000) / 100; // as percentage
  }

  async saveDemandData(productId: string, data: {
    marketplace: string;
    bsr?: number;
    bsrCategory?: string;
    estimatedMonthlySales?: number;
    soldLast30Days?: number;
    sellThroughRate?: number;
    demandScore?: number;
    confidenceScore?: number;
    competitionLevel?: string;
  }) {
    return this.prisma.demandData.create({
      data: {
        productId,
        marketplace: data.marketplace as any,
        bsr: data.bsr,
        bsrCategory: data.bsrCategory,
        estimatedMonthlySales: data.estimatedMonthlySales,
        soldLast30Days: data.soldLast30Days,
        sellThroughRate: data.sellThroughRate,
        demandScore: data.demandScore,
        confidenceScore: data.confidenceScore,
        competitionLevel: (data.competitionLevel as any) ?? 'MEDIUM',
      },
    });
  }

  async getLatestDemandData(productId: string, marketplace?: string) {
    return this.prisma.demandData.findFirst({
      where: { productId, ...(marketplace ? { marketplace: marketplace as any } : {}) },
      orderBy: { recordedAt: 'desc' },
    });
  }

  async estimateDaysToSell(monthlySales: number, recommendedQuantity: number): Promise<number> {
    if (monthlySales <= 0) return 999;
    const dailySales = monthlySales / 30;
    return Math.ceil(recommendedQuantity / dailySales);
  }

  calculateRecommendedQuantity(monthlySales: number, budget: number, purchasePrice: number): number {
    if (monthlySales <= 0 || purchasePrice <= 0) return 1;
    // Don't buy more than 2 months supply
    const maxByDemand = Math.ceil(monthlySales * 2);
    // Don't exceed budget
    const maxByBudget = Math.floor(budget / purchasePrice);
    // Start conservative - 1 month supply
    const conservative = Math.ceil(monthlySales);
    return Math.min(conservative, maxByBudget, maxByDemand, 100);
  }
}
