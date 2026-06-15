import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProfitabilityService } from '../profitability/profitability.service';
import { DemandService } from '../demand/demand.service';
import { RecommendationsService } from '../recommendations/recommendations.service';
import { AlertsService } from '../alerts/alerts.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface OpportunityFilter {
  status?: string;
  marketplace?: string;
  minRoi?: number;
  minProfit?: number;
  minScore?: number;
  riskLevel?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class OpportunitiesService {
  private readonly logger = new Logger(OpportunitiesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly profitabilityService: ProfitabilityService,
    private readonly demandService: DemandService,
    private readonly recommendationsService: RecommendationsService,
    private readonly alertsService: AlertsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(filter: OpportunityFilter = {}) {
    const {
      status = 'ACTIVE', marketplace, minRoi, minProfit, minScore,
      riskLevel, page = 1, limit = 20, sortBy = 'overallScore', sortOrder = 'desc',
    } = filter;

    const where: any = { status };
    if (marketplace) where.targetMarketplace = marketplace;
    if (minRoi) where.estimatedRoi = { gte: minRoi };
    if (minProfit) where.estimatedProfit = { gte: minProfit };
    if (minScore) where.overallScore = { gte: minScore };
    if (riskLevel) where.riskLevel = riskLevel;

    const skip = (page - 1) * limit;

    const [opportunities, total] = await Promise.all([
      this.prisma.opportunity.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip, take: limit,
        include: {
          product: { select: { id: true, title: true, brand: true, imageUrl: true, upc: true, asin: true, category: true, weightLbs: true } },
        },
      }),
      this.prisma.opportunity.count({ where }),
    ]);

    return {
      data: opportunities,
      meta: { total, page, limit, pages: Math.ceil(total / limit), showing: opportunities.length },
    };
  }

  async findOne(id: string) {
    const opp = await this.prisma.opportunity.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            marketplaceListings: { include: { feeCalculations: { take: 1, orderBy: { calculatedAt: 'desc' } } } },
            demandData: { take: 3, orderBy: { recordedAt: 'desc' } },
            priceHistory: { take: 30, orderBy: { recordedAt: 'desc' } },
            retailListings: { include: { store: true } },
          },
        },
      },
    });
    if (!opp) throw new NotFoundException('Opportunity not found');
    return opp;
  }

  async analyzeAndCreateOpportunity(params: {
    productId: string;
    retailStoreId?: string;
    retailStoreName: string;
    buyPrice: number;
    marketplace: string;
    sellPrice: number;
    weightLbs: number;
    category?: string;
    userId?: string;
    budget?: number;
    bsr?: number;
    estimatedMonthlySales?: number;
    totalSellers?: number;
    fbaSellerCount?: number;
    reviewCount?: number;
    rating?: number;
  }) {
    const product = await this.prisma.product.findUnique({ where: { id: params.productId } });
    if (!product) throw new NotFoundException('Product not found');

    // 1. Calculate profitability
    const profitability = this.profitabilityService.calculate({
      purchasePrice: params.buyPrice,
      salePrice: params.sellPrice,
      marketplace: params.marketplace as any,
      fulfillmentMethod: 'FBA',
      weightLbs: params.weightLbs,
      category: params.category,
    });

    // 2. Assess demand
    const estimatedMonthlySales = params.estimatedMonthlySales ??
      (params.bsr ? this.demandService.estimateSalesFromBsr(params.bsr, params.category ?? 'default') : 30);

    const demandScore = this.demandService.calculateDemandScore({
      bsr: params.bsr,
      estimatedMonthlySales,
      reviewCount: params.reviewCount,
      rating: params.rating,
      totalSellers: params.totalSellers,
    });

    const competition = this.demandService.assessCompetition(
      params.totalSellers ?? 0,
      params.fbaSellerCount ?? 0,
    );

    // 3. AI Recommendation
    const budget = params.budget ?? 1000;
    const rec = await this.recommendationsService.generateRecommendation({
      productTitle: product.title,
      productCategory: params.category,
      purchasePrice: params.buyPrice,
      sellPrice: params.sellPrice,
      profitability,
      demandScore,
      competitionLevel: competition,
      estimatedMonthlySales,
      bsr: params.bsr,
      totalSellers: params.totalSellers ?? 0,
      fbaSellerCount: params.fbaSellerCount ?? 0,
      budget,
    });

    // 4. Calculate overall score (0-100)
    const profitScore = Math.min(30, profitability.roi / 2);
    const netProfitScore = Math.min(20, profitability.netProfit * 2);
    const overallScore = Math.min(100, profitScore + netProfitScore + (demandScore * 0.5));

    // 5. Estimate days to sell
    const estimatedDaysToSell = estimatedMonthlySales > 0
      ? Math.ceil(rec.recommendedQuantity / (estimatedMonthlySales / 30)) : 90;

    // 6. Save opportunity
    const opportunity = await this.prisma.opportunity.create({
      data: {
        productId: params.productId,
        retailStoreId: params.retailStoreId,
        retailStoreName: params.retailStoreName,
        buyPrice: params.buyPrice,
        sellPrice: params.sellPrice,
        estimatedProfit: profitability.netProfit,
        estimatedRoi: profitability.roi,
        estimatedMargin: profitability.margin,
        demandScore,
        competitionScore: 100 - (competition === 'VERY_HIGH' ? 90 : competition === 'HIGH' ? 70 : competition === 'MEDIUM' ? 50 : competition === 'LOW' ? 30 : 10),
        overallScore,
        riskLevel: rec.riskLevel,
        fulfillmentMethod: 'FBA',
        targetMarketplace: params.marketplace as any,
        recommendedQuantity: rec.recommendedQuantity,
        estimatedDaysToSell,
        aiSummary: rec.summary,
        aiRecommendation: rec.recommendation,
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      },
      include: { product: true },
    });

    // 7. Emit event for alert processing
    this.eventEmitter.emit('opportunity.created', { opportunity, userId: params.userId });

    this.logger.log(`Opportunity created: ${product.title} | ROI: ${profitability.roi.toFixed(1)}% | Score: ${overallScore.toFixed(0)}`);
    return opportunity;
  }

  async getStats() {
    const [total, activeOpps, avgRoi, topOpps] = await Promise.all([
      this.prisma.opportunity.count(),
      this.prisma.opportunity.count({ where: { status: 'ACTIVE' } }),
      this.prisma.opportunity.aggregate({ _avg: { estimatedRoi: true }, where: { status: 'ACTIVE' } }),
      this.prisma.opportunity.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { overallScore: 'desc' },
        take: 5,
        include: { product: { select: { title: true, imageUrl: true, brand: true } } },
      }),
    ]);

    const totalPotentialProfit = await this.prisma.opportunity.aggregate({
      _sum: { estimatedProfit: true },
      where: { status: 'ACTIVE' },
    });

    return {
      totalOpportunities: total,
      activeOpportunities: activeOpps,
      avgRoi: Math.round((avgRoi._avg.estimatedRoi ?? 0) * 100) / 100,
      totalPotentialProfit: Math.round((totalPotentialProfit._sum.estimatedProfit ?? 0) * 100) / 100,
      topOpportunities: topOpps,
    };
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.opportunity.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async dismiss(id: string) {
    return this.updateStatus(id, 'DISMISSED');
  }

  async markPurchased(id: string) {
    return this.updateStatus(id, 'PURCHASED');
  }
}
