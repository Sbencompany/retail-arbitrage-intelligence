import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import dayjs from 'dayjs';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDashboardKpis() {
    const now = new Date();
    const thirtyDaysAgo = dayjs().subtract(30, 'days').toDate();

    const [
      totalOpportunities, activeOpportunities,
      avgRoiResult, totalProfitResult,
      productsMonitored, newOpportunitiesThisMonth,
      topStores, topCategories,
    ] = await Promise.all([
      this.prisma.opportunity.count(),
      this.prisma.opportunity.count({ where: { status: 'ACTIVE' } }),
      this.prisma.opportunity.aggregate({ _avg: { estimatedRoi: true }, where: { status: 'ACTIVE' } }),
      this.prisma.opportunity.aggregate({ _sum: { estimatedProfit: true }, where: { status: 'ACTIVE' } }),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.opportunity.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.opportunity.groupBy({
        by: ['retailStoreName'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
      this.prisma.product.groupBy({
        by: ['category'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
        where: { category: { not: null } },
      }),
    ]);

    const roiDistribution = await this.getRoiDistribution();
    const opportunityTrend = await this.getOpportunityTrend(30);

    return {
      kpis: {
        totalOpportunities,
        activeOpportunities,
        avgRoi: Math.round((avgRoiResult._avg.estimatedRoi ?? 0) * 100) / 100,
        totalPotentialProfit: Math.round((totalProfitResult._sum.estimatedProfit ?? 0) * 100) / 100,
        productsMonitored,
        newThisMonth: newOpportunitiesThisMonth,
      },
      topStores: topStores.map(s => ({ name: s.retailStoreName, count: s._count.id })),
      topCategories: topCategories.map(c => ({ category: c.category, count: c._count.id })),
      roiDistribution,
      opportunityTrend,
    };
  }

  private async getRoiDistribution() {
    const opportunities = await this.prisma.opportunity.findMany({
      where: { status: 'ACTIVE' },
      select: { estimatedRoi: true },
    });

    const buckets = [
      { label: '0-15%', min: 0, max: 15, count: 0 },
      { label: '15-30%', min: 15, max: 30, count: 0 },
      { label: '30-50%', min: 30, max: 50, count: 0 },
      { label: '50-100%', min: 50, max: 100, count: 0 },
      { label: '100%+', min: 100, max: Infinity, count: 0 },
    ];

    for (const opp of opportunities) {
      const roi = opp.estimatedRoi;
      for (const bucket of buckets) {
        if (roi >= bucket.min && roi < bucket.max) { bucket.count++; break; }
      }
    }
    return buckets;
  }

  private async getOpportunityTrend(days: number) {
    const results: { date: string; count: number; avgRoi: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = dayjs().subtract(i, 'days');
      const start = date.startOf('day').toDate();
      const end = date.endOf('day').toDate();

      const agg = await this.prisma.opportunity.aggregate({
        _count: { id: true },
        _avg: { estimatedRoi: true },
        where: { createdAt: { gte: start, lte: end } },
      });

      results.push({
        date: date.format('YYYY-MM-DD'),
        count: agg._count.id,
        avgRoi: Math.round((agg._avg.estimatedRoi ?? 0) * 10) / 10,
      });
    }
    return results;
  }

  async getTopOpportunities(limit = 10) {
    return this.prisma.opportunity.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { overallScore: 'desc' },
      take: limit,
      include: {
        product: { select: { id: true, title: true, brand: true, imageUrl: true, category: true, asin: true, upc: true } },
      },
    });
  }
}
