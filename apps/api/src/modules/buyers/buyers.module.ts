import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BuyersController } from './controllers/buyers.controller';
import { BUYER_REPOSITORY } from './repositories/buyer.repository';
import { MongoBuyerRepository } from './repositories/mongo-buyer.repository';
import { BuyerDocument, BuyerSchema } from './schemas/buyer.schema';
import { RegisterBuyerUseCase } from './use-cases/register-buyer.use-case';

@Module({
  imports: [MongooseModule.forFeature([{ name: BuyerDocument.name, schema: BuyerSchema }])],
  controllers: [BuyersController],
  providers: [{ provide: BUYER_REPOSITORY, useClass: MongoBuyerRepository }, RegisterBuyerUseCase],
  exports: [BUYER_REPOSITORY],
})
export class BuyersModule {}
