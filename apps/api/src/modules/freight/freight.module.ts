import { Module } from '@nestjs/common';
import { FreightController } from './freight.controller';
import { FreightService } from './freight.service';
import { UspsAdapter } from './adapters/usps.adapter';
import { UpsAdapter } from './adapters/ups.adapter';
import { FedexAdapter } from './adapters/fedex.adapter';

@Module({
  controllers: [FreightController],
  providers: [FreightService, UspsAdapter, UpsAdapter, FedexAdapter],
  exports: [FreightService],
})
export class FreightModule {}
