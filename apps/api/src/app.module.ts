import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bull';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { OpportunitiesModule } from './modules/opportunities/opportunities.module';
import { DealDiscoveryModule } from './modules/deal-discovery/deal-discovery.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { ProfitabilityModule } from './modules/profitability/profitability.module';
import { FreightModule } from './modules/freight/freight.module';
import { DemandModule } from './modules/demand/demand.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { GeolocationModule } from './modules/geolocation/geolocation.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env.local', '.env'], expandVariables: true }),
    ThrottlerModule.forRoot([
      { name: 'short',  ttl: 1000,  limit: 20  },
      { name: 'medium', ttl: 10000, limit: 100 },
      { name: 'long',   ttl: 60000, limit: 500 },
    ]),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({ wildcard: true, delimiter: '.', maxListeners: 20 }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        redis: {
          host: cfg.get('REDIS_HOST', 'localhost'),
          port: cfg.get<number>('REDIS_PORT', 6379),
          password: cfg.get('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          removeOnComplete: 100, removeOnFail: 50,
          attempts: 3, backoff: { type: 'exponential', delay: 3000 },
        },
      }),
    }),
    PrismaModule,
    AuthModule, UsersModule, ProductsModule,
    OpportunitiesModule, DealDiscoveryModule, MarketplaceModule,
    ProfitabilityModule, FreightModule, DemandModule,
    AlertsModule, RecommendationsModule, GeolocationModule,
    AnalyticsModule, HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
