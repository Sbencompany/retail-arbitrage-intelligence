import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { DealDiscoveryController } from './deal-discovery.controller';
import { DealDiscoveryService } from './deal-discovery.service';
import { DealDiscoveryProcessor } from './deal-discovery.processor';
import { WalmartDealsAdapter } from './adapters/walmart.adapter';
import { BestBuyDealsAdapter } from './adapters/bestbuy.adapter';
import { TargetDealsAdapter } from './adapters/target.adapter';
import { CvsDealsAdapter } from './adapters/cvs.adapter';
import { WalgreensDealsAdapter } from './adapters/walgreens.adapter';
import { KohlsDealsAdapter } from './adapters/kohls.adapter';
import { OpportunitiesModule } from '../opportunities/opportunities.module';
import { MarketplaceModule } from '../marketplace/marketplace.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'deal-discovery' }),
    OpportunitiesModule,
    MarketplaceModule,
  ],
  controllers: [DealDiscoveryController],
  providers: [
    DealDiscoveryService, DealDiscoveryProcessor,
    WalmartDealsAdapter, BestBuyDealsAdapter, TargetDealsAdapter,
    CvsDealsAdapter, WalgreensDealsAdapter, KohlsDealsAdapter,
  ],
  exports: [DealDiscoveryService],
})
export class DealDiscoveryModule {}
