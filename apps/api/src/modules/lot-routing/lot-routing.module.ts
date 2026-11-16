import { Module } from '@nestjs/common';
import { HarvestLotsModule } from '../harvest-lots/harvest-lots.module';
import { MarketplaceModule } from '../marketplace/marketplace.module';
import { SurplusModule } from '../surplus/surplus.module';
import { LotDestinationsController } from './controllers/lot-destinations.controller';
import { ConfirmLotDestinationUseCase } from './use-cases/confirm-lot-destination.use-case';

/** Orquestra a saída do lote para o destino escolhido (fica fora de harvest-lots para evitar dependência circular). */
@Module({
  imports: [HarvestLotsModule, MarketplaceModule, SurplusModule],
  controllers: [LotDestinationsController],
  providers: [ConfirmLotDestinationUseCase],
  exports: [ConfirmLotDestinationUseCase],
})
export class LotRoutingModule {}
