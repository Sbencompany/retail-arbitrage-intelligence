import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AmazonSpAdapter } from './adapters/amazon-sp.adapter';
import { WalmartAdapter } from './adapters/walmart.adapter';
import { EbayAdapter } from './adapters/ebay.adapter';
import { BestBuyAdapter } from './adapters/bestbuy.adapter';

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly amazon: AmazonSpAdapter,
    private readonly walmart: WalmartAdapter,
    private readonly ebay: EbayAdapter,
    private readonly bestbuy: BestBuyAdapter,
  ) {}

  async searchByUpc(upc: string): Promise<any> {
    const results: any = { upc, amazon: null, walmart: null, ebay: null };

    const [amazonConfigured, walmartConfigured, ebayConfigured] = await Promise.all([
      this.amazon.isConfigured(),
      this.walmart.isConfigured(),
      this.ebay.isConfigured(),
    ]);

    const searches = await Promise.allSettled([
      amazonConfigured ? this.amazon.searchItems('', [upc]) : Promise.resolve(null),
      walmartConfigured ? this.walmart.searchItems(upc) : Promise.resolve(null),
      ebayConfigured ? this.ebay.searchByUpc(upc) : Promise.resolve(null),
    ]);

    if (searches[0].status === 'fulfilled') results.amazon = searches[0].value;
    if (searches[1].status === 'fulfilled') results.walmart = searches[1].value;
    if (searches[2].status === 'fulfilled') results.ebay = searches[2].value;

    return results;
  }

  async getAmazonListingByAsin(asin: string): Promise<any> {
    if (!await this.amazon.isConfigured()) {
      return this.getMockAmazonListing(asin);
    }
    try {
      const [catalog, pricing] = await Promise.allSettled([
        this.amazon.getCatalogItem(asin),
        this.amazon.getCompetitivePricing([asin]),
      ]);
      return {
        catalog: catalog.status === 'fulfilled' ? catalog.value : null,
        pricing: pricing.status === 'fulfilled' ? pricing.value : null,
      };
    } catch (e) {
      this.logger.error('Amazon listing fetch failed: ' + e.message);
      return this.getMockAmazonListing(asin);
    }
  }

  async syncMarketplaceListing(productId: string, asin: string) {
    const listing = await this.getAmazonListingByAsin(asin);
    if (!listing) return null;

    // Extract price from listing
    const price = listing?.pricing?.responses?.[0]?.body?.payload?.CompetitiveSummaryResponse?.lowestPricedOffers?.[0]?.ListingPrice?.Amount
      ?? listing.mockPrice ?? 0;

    return this.prisma.marketplaceListing.upsert({
      where: { marketplace_marketplaceId: { marketplace: 'AMAZON', marketplaceId: asin } },
      update: { currentPrice: price, lastUpdated: new Date() },
      create: {
        productId,
        marketplace: 'AMAZON',
        marketplaceId: asin,
        title: listing.mockTitle ?? 'Amazon Product',
        currentPrice: price,
        url: `https://www.amazon.com/dp/${asin}`,
      },
    });
  }

  private getMockAmazonListing(asin: string) {
    const mockPrices: Record<string, number> = {
      'B07XJ8C8F5': 79.95,
      'B08N5WRWNW': 49.99,
      'B09JQMJHXY': 449.95,
      'B07W6BXFVD': 279.99,
      'B07ZPKN6YR': 399.99,
    };
    return {
      mockPrice: mockPrices[asin] ?? 49.99,
      mockTitle: `Amazon Product ${asin}`,
      asin,
    };
  }

  async searchAllMarketplaces(query: string) {
    const results: any = { amazon: [], walmart: [], ebay: [] };

    const searches = await Promise.allSettled([
      this.amazon.isConfigured().then(ok => ok ? this.amazon.searchItems(query) : null),
      this.walmart.isConfigured().then(ok => ok ? this.walmart.searchItems(query) : null),
      this.ebay.isConfigured().then(ok => ok ? this.ebay.searchItems(query) : null),
    ]);

    if (searches[0].status === 'fulfilled') results.amazon = searches[0].value;
    if (searches[1].status === 'fulfilled') results.walmart = searches[1].value;
    if (searches[2].status === 'fulfilled') results.ebay = searches[2].value;

    return results;
  }

  async getMarketplaceStatus() {
    const [amazon, walmart, ebay] = await Promise.all([
      this.amazon.isConfigured(),
      this.walmart.isConfigured(),
      this.ebay.isConfigured(),
    ]);
    return {
      amazon: { configured: amazon, name: 'Amazon SP-API' },
      walmart: { configured: walmart, name: 'Walmart Marketplace API' },
      ebay: { configured: ebay, name: 'eBay Browse API' },
    };
  }
}
