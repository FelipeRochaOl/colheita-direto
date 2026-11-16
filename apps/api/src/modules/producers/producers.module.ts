import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProducersController } from './controllers/producers.controller';
import { MongoProducerRepository } from './repositories/mongo-producer.repository';
import { PRODUCER_REPOSITORY } from './repositories/producer.repository';
import { ProducerDocument, ProducerSchema } from './schemas/producer.schema';
import { GetProducerProfileUseCase } from './use-cases/get-producer-profile.use-case';
import { RegisterProducerUseCase } from './use-cases/register-producer.use-case';

@Module({
  imports: [MongooseModule.forFeature([{ name: ProducerDocument.name, schema: ProducerSchema }])],
  controllers: [ProducersController],
  providers: [
    { provide: PRODUCER_REPOSITORY, useClass: MongoProducerRepository },
    RegisterProducerUseCase,
    GetProducerProfileUseCase,
  ],
  exports: [PRODUCER_REPOSITORY],
})
export class ProducersModule {}
