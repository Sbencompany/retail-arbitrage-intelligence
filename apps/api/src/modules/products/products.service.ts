import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: { search?: string; category?: string; brand?: string; page?: number; limit?: number }) {
    const { search, category, brand, page = 1, limit = 20 } = params;
    const where: any = { isActive: true };
    if (search) where.title = { contains: search, mode: 'insensitive' };
    if (category) where.category = category;
    if (brand) where.brand = brand;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          retailListings: { where: { isOnSale: true }, take: 3 },
          demandData: { take: 1, orderBy: { recordedAt: 'desc' } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);
    return { data: products, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        retailListings: { include: { store: true }, orderBy: { salePrice: 'asc' } },
        marketplaceListings: { include: { feeCalculations: { take: 1, orderBy: { calculatedAt: 'desc' } } } },
        opportunities: { where: { status: 'ACTIVE' }, orderBy: { overallScore: 'desc' }, take: 5 },
        demandData: { take: 5, orderBy: { recordedAt: 'desc' } },
        priceHistory: { take: 30, orderBy: { recordedAt: 'desc' } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findByUpc(upc: string) {
    const product = await this.prisma.product.findUnique({ where: { upc } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findByAsin(asin: string) {
    const product = await this.prisma.product.findUnique({ where: { asin } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(data: any) {
    return this.prisma.product.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.product.update({ where: { id }, data });
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.prisma.product.findMany({
      where: { category: { not: null }, isActive: true },
      select: { category: true },
      distinct: ['category'],
    });
    return categories.map(c => c.category!).filter(Boolean).sort();
  }

  async getBrands(): Promise<string[]> {
    const brands = await this.prisma.product.findMany({
      where: { brand: { not: null }, isActive: true },
      select: { brand: true },
      distinct: ['brand'],
    });
    return brands.map(b => b.brand!).filter(Boolean).sort();
  }
}
