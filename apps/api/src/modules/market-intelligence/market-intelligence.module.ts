import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PriceReferencesController } from './controllers/price-references.controller';
import { MongoPriceReferenceRepository } from './repositories/mongo-price-reference.repository';
import { PRICE_REFERENCE_REPOSITORY } from './repositories/price-reference.repository';
import { PriceReferenceDocument, PriceReferenceSchema } from './schemas/price-reference.schema';
import { LotPriceSuggester } from './services/lot-price-suggester';
import { RegisterPriceReferenceUseCase } from './use-cases/register-price-reference.use-case';

@Module({
  imports: [MongooseModule.forFeature([{ name: PriceReferenceDocument.name, schema: PriceReferenceSchema }])],
  controllers: [PriceReferencesController],
  providers: [
    { provide: PRICE_REFERENCE_REPOSITORY, useClass: MongoPriceReferenceRepository },
    LotPriceSuggester,
    RegisterPriceReferenceUseCase,
  ],
  exports: [LotPriceSuggester, RegisterPriceReferenceUseCase],
})
export class MarketIntelligenceModule {}
