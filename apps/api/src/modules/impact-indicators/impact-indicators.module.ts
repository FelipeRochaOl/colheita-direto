import { Module } from '@nestjs/common';
import { HarvestLotsModule } from '../harvest-lots/harvest-lots.module';
import { OrdersModule } from '../orders/orders.module';
import { ProducersModule } from '../producers/producers.module';
import { SurplusModule } from '../surplus/surplus.module';
import { ImpactIndicatorsController } from './controllers/impact-indicators.controller';
import { GetImpactIndicatorsUseCase } from './use-cases/get-impact-indicators.use-case';

@Module({
  imports: [ProducersModule, HarvestLotsModule, OrdersModule, SurplusModule],
  controllers: [ImpactIndicatorsController],
  providers: [GetImpactIndicatorsUseCase],
})
export class ImpactIndicatorsModule {}
