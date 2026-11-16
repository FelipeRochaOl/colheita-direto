import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketIntelligenceModule } from '../market-intelligence/market-intelligence.module';
import { HarvestLotsController } from './controllers/harvest-lots.controller';
import { HarvestLotCreatedHandler } from './event-handlers/harvest-lot-created.handler';
import { HARVEST_LOT_REPOSITORY } from './repositories/harvest-lot.repository';
import { MongoHarvestLotRepository } from './repositories/mongo-harvest-lot.repository';
import { HarvestLotDocument, HarvestLotSchema } from './schemas/harvest-lot.schema';
import { HarvestLotPresenter } from './services/harvest-lot-presenter';
import { HttpVisionQualityClassifier } from './services/http-vision-quality-classifier';
import { LotClassificationMessageBuilder } from './services/lot-classification-message-builder';
import { LotDestinationPolicy } from './services/lot-destination-policy';
import { QUALITY_CLASSIFIER } from './services/quality-classifier';
import { ClassifyHarvestLotUseCase } from './use-cases/classify-harvest-lot.use-case';
import { CreateHarvestLotUseCase } from './use-cases/create-harvest-lot.use-case';
import { CreatePhotoUploadUrlsUseCase } from './use-cases/create-photo-upload-urls.use-case';
import { GetHarvestLotUseCase } from './use-cases/get-harvest-lot.use-case';
import { ListProducerHarvestLotsUseCase } from './use-cases/list-producer-harvest-lots.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: HarvestLotDocument.name, schema: HarvestLotSchema }]),
    MarketIntelligenceModule,
  ],
  controllers: [HarvestLotsController],
  providers: [
    { provide: HARVEST_LOT_REPOSITORY, useClass: MongoHarvestLotRepository },
    { provide: QUALITY_CLASSIFIER, useClass: HttpVisionQualityClassifier },
    LotDestinationPolicy,
    LotClassificationMessageBuilder,
    HarvestLotPresenter,
    CreatePhotoUploadUrlsUseCase,
    CreateHarvestLotUseCase,
    ClassifyHarvestLotUseCase,
    ListProducerHarvestLotsUseCase,
    GetHarvestLotUseCase,
    HarvestLotCreatedHandler,
  ],
  exports: [
    HARVEST_LOT_REPOSITORY,
    LotDestinationPolicy,
    HarvestLotPresenter,
    CreateHarvestLotUseCase,
    ListProducerHarvestLotsUseCase,
    HarvestLotCreatedHandler,
  ],
})
export class HarvestLotsModule {}
