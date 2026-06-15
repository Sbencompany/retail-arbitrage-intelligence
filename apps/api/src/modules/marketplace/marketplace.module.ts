import { Module } from '@nestjs/common';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { AmazonSpAdapter } from './adapters/amazon-sp.adapter';
import { WalmartAdapter } from './adapters/walmart.adapter';
import { EbayAdapter } from './adapters/ebay.adapter';
import { BestBuyAdapter } from './adapters/bestbuy.adapter';

@Module({
  controllers: [MarketplaceController],
  providers: [MarketplaceService, AmazonSpAdapter, WalmartAdapter, EbayAdapter, BestBuyAdapter],
  exports: [MarketplaceService, AmazonSpAdapter, WalmartAdapter, EbayAdapter],
})
export class MarketplaceModule {}
