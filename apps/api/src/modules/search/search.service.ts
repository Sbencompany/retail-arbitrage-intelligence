import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async search(query: string, type?: string) {
    const results: any = { products: [], opportunities: [] };

    if (!type || type === 'products') {
      results.products = await this.prisma.product.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { brand: { contains: query, mode: 'insensitive' } },
            { upc: { contains: query } },
            { asin: { contains: query, mode: 'insensitive' } },
          ],
          isActive: true,
        },
        take: 10,
        select: { id: true, title: true, brand: true, imageUrl: true, category: true, upc: true, asin: true },
      });
    }

    if (!type || type === 'opportunities') {
      results.opportunities = await this.prisma.opportunity.findMany({
        where: {
          status: 'ACTIVE',
          product: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { brand: { contains: query, mode: 'insensitive' } },
            ],
          },
        },
        take: 10,
        include: { product: { select: { id: true, title: true, brand: true, imageUrl: true } } },
        orderBy: { overallScore: 'desc' },
      });
    }

    return results;
  }
}
