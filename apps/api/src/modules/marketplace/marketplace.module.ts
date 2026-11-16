import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProducersModule } from '../producers/producers.module';
import { OffersController } from './controllers/offers.controller';
import { MongoOfferRepository } from './repositories/mongo-offer.repository';
import { OFFER_REPOSITORY } from './repositories/offer.repository';
import { OfferDocument, OfferSchema } from './schemas/offer.schema';
import { OfferPresenter } from './services/offer-presenter';
import { GetOfferUseCase } from './use-cases/get-offer.use-case';
import { PublishOfferUseCase } from './use-cases/publish-offer.use-case';
import { SearchOffersUseCase } from './use-cases/search-offers.use-case';

@Module({
  imports: [MongooseModule.forFeature([{ name: OfferDocument.name, schema: OfferSchema }]), ProducersModule],
  controllers: [OffersController],
  providers: [
    { provide: OFFER_REPOSITORY, useClass: MongoOfferRepository },
    OfferPresenter,
    PublishOfferUseCase,
    SearchOffersUseCase,
    GetOfferUseCase,
  ],
  exports: [OFFER_REPOSITORY, PublishOfferUseCase, SearchOffersUseCase],
})
export class MarketplaceModule {}
