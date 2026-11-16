import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServiceProvidersController } from './controllers/service-providers.controller';
import { MongoServiceProviderRepository } from './repositories/mongo-service-provider.repository';
import { SERVICE_PROVIDER_REPOSITORY } from './repositories/service-provider.repository';
import { ServiceProviderDocument, ServiceProviderSchema } from './schemas/service-provider.schema';
import { ServiceFeeCalculator } from './services/service-fee-calculator';
import { ApproveServiceProviderUseCase } from './use-cases/approve-service-provider.use-case';
import { RegisterServiceProviderUseCase } from './use-cases/register-service-provider.use-case';

@Module({
  imports: [MongooseModule.forFeature([{ name: ServiceProviderDocument.name, schema: ServiceProviderSchema }])],
  controllers: [ServiceProvidersController],
  providers: [
    { provide: SERVICE_PROVIDER_REPOSITORY, useClass: MongoServiceProviderRepository },
    ServiceFeeCalculator,
    RegisterServiceProviderUseCase,
    ApproveServiceProviderUseCase,
  ],
  exports: [SERVICE_PROVIDER_REPOSITORY, ServiceFeeCalculator],
})
export class ServiceProvidersModule {}
