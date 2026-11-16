import { Module } from '@nestjs/common';
import { AppConfigModule } from './shared/config/app-config.module';
import { DatabaseModule } from './shared/database/database.module';
import { QueueModule } from './shared/queue/queue.module';
import { StorageModule } from './shared/storage/storage.module';
import { IdentityModule } from './modules/identity/identity.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AssistantModule } from './modules/assistant/assistant.module';
import { BuyersModule } from './modules/buyers/buyers.module';
import { FarmManagementModule } from './modules/farm-management/farm-management.module';
import { HarvestLotsModule } from './modules/harvest-lots/harvest-lots.module';
import { ImpactIndicatorsModule } from './modules/impact-indicators/impact-indicators.module';
import { LotRoutingModule } from './modules/lot-routing/lot-routing.module';
import { MarketIntelligenceModule } from './modules/market-intelligence/market-intelligence.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ProducersModule } from './modules/producers/producers.module';
import { ServiceProvidersModule } from './modules/service-providers/service-providers.module';
import { SurplusModule } from './modules/surplus/surplus.module';

/** Todos os módulos de domínio. Usado pelos dois entrypoints: HTTP (main.ts) e worker (worker.ts). */
@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    QueueModule,
    StorageModule,
    NotificationsModule,
    IdentityModule,
    ProducersModule,
    BuyersModule,
    ServiceProvidersModule,
    MarketIntelligenceModule,
    HarvestLotsModule,
    MarketplaceModule,
    SurplusModule,
    LotRoutingModule,
    OrdersModule,
    FarmManagementModule,
    ImpactIndicatorsModule,
    AssistantModule,
  ],
})
export class CoreModule {}
