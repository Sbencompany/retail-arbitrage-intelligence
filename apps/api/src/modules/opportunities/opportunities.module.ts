import { Module } from '@nestjs/common';
import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';
import { ProfitabilityModule } from '../profitability/profitability.module';
import { DemandModule } from '../demand/demand.module';
import { RecommendationsModule } from '../recommendations/recommendations.module';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [ProfitabilityModule, DemandModule, RecommendationsModule, AlertsModule],
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService],
  exports: [OpportunitiesService],
})
export class OpportunitiesModule {}
