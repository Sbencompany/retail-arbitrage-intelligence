import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { OpportunitiesService } from '../opportunities/opportunities.service';
import { MarketplaceService } from '../marketplace/marketplace.service';
import { WalmartDealsAdapter } from './adapters/walmart.adapter';
import { BestBuyDealsAdapter } from './adapters/bestbuy.adapter';
import { TargetDealsAdapter } from './adapters/target.adapter';
import { CvsDealsAdapter } from './adapters/cvs.adapter';
import { WalgreensDealsAdapter } from './adapters/walgreens.adapter';
import { KohlsDealsAdapter } from './adapters/kohls.adapter';
import { BaseAdapter, DiscoveredDeal } from './adapters/base.adapter';

@Injectable()
export class DealDiscoveryService {
  private readonly logger = new Logger(DealDiscoveryService.name);
  private readonly adapters: Map<string, BaseAdapter>;

  constructor(
    @InjectQueue('deal-discovery') private readonly dealQueue: Queue,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly opportunitiesService: OpportunitiesService,
    private readonly marketplaceService: MarketplaceService,
    private readonly walmart: WalmartDealsAdapter,
    private readonly bestbuy: BestBuyDealsAdapter,
    private readonly target: TargetDealsAdapter,
    private readonly cvs: CvsDealsAdapter,
    private readonly walgreens: WalgreensDealsAdapter,
    private readonly kohls: KohlsDealsAdapter,
  ) {
    this.adapters = new Map([
      ['walmart', walmart],
      ['bestbuy', bestbuy],
      ['target', target],
      ['cvs', cvs],
      ['walgreens', walgreens],
      ['kohls', kohls],
    ]);
  }

  // Run full scan every 2 hours
  @Cron('0 */2 * * *')
  async scheduledScan() {
    this.logger.log('Starting scheduled deal scan...');
    await this.startFullScan();
  }

  async startFullScan(): Promise<void> {
    const stores = await this.prisma.retailStore.findMany({ where: { isActive: true } });
    for (const store of stores) {
      await this.dealQueue.add('scan-store', { storeSlug: store.slug, storeId: store.id }, {
        priority: 5,
        jobId: `scan-${store.slug}-${Date.now()}`,
      });
    }
    this.logger.log(`Queued scans for ${stores.length} stores`);
  }

  async scanStore(storeSlug: string): Promise<DiscoveredDeal[]> {
    const adapter = this.adapters.get(storeSlug);
    if (!adapter) { this.logger.warn(`No adapter: ${storeSlug}`); return []; }

    const available = await adapter.isAvailable();
    this.logger.log(`Scanning ${storeSlug} (available: ${available})`);

    const deals = await adapter.fetchDeals();
    this.logger.log(`Found ${deals.length} deals from ${storeSlug}`);

    await this.persistDeals(storeSlug, deals);
    this.eventEmitter.emit('deals.discovered', { storeSlug, count: deals.length, deals });
    return deals;
  }

  private async persistDeals(storeSlug: string, deals: DiscoveredDeal[]): Promise<void> {
    const store = await this.prisma.retailStore.findUnique({ where: { slug: storeSlug } });
    if (!store) return;

    let created = 0;
    for (const deal of deals) {
      try {
        // Find or create product
        let product = deal.upc
          ? await this.prisma.product.findUnique({ where: { upc: deal.upc } })
          : null;

        if (!product) {
          product = await this.prisma.product.create({
            data: {
              upc: deal.upc,
              title: deal.title,
              brand: deal.brand,
              category: deal.category,
              imageUrl: deal.imageUrl,
              weightLbs: deal.weight,
            },
          });
        }

        // Upsert retail listing
        const existing = await this.prisma.retailListing.findFirst({
          where: { productId: product.id, storeId: store.id, ...(deal.sku ? { storeSku: deal.sku } : {}) },
        });

        if (existing) {
          await this.prisma.retailListing.update({
            where: { id: existing.id },
            data: { regularPrice: deal.originalPrice, salePrice: deal.salePrice, discount: deal.discountPercent, isOnSale: true, inStock: deal.inStock, lastCheckedAt: new Date() },
          });
        } else {
          await this.prisma.retailListing.create({
            data: {
              productId: product.id, storeId: store.id,
              storeSku: deal.sku, url: deal.url,
              regularPrice: deal.originalPrice, salePrice: deal.salePrice,
              discount: deal.discountPercent, isOnSale: true, inStock: deal.inStock,
              dealType: deal.dealType as any,
            },
          });
          created++;
        }
      } catch (e) {
        this.logger.warn(`Failed to persist deal ${deal.title}: ${e.message}`);
      }
    }
    this.logger.log(`${storeSlug}: ${created} new listings created`);
  }

  async getScanStatus() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.dealQueue.getWaitingCount(),
      this.dealQueue.getActiveCount(),
      this.dealQueue.getCompletedCount(),
      this.dealQueue.getFailedCount(),
    ]);
    return { waiting, active, completed, failed, adapters: Array.from(this.adapters.keys()) };
  }
}
