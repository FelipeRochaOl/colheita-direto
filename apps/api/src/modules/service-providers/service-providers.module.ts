import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProducersModule } from '../producers/producers.module';
import { ServiceProvidersController } from './controllers/service-providers.controller';
import { ServiceRequestsController } from './controllers/service-requests.controller';
import { MongoServiceProviderRepository } from './repositories/mongo-service-provider.repository';
import { MongoServiceRequestRepository } from './repositories/mongo-service-request.repository';
import { SERVICE_PROVIDER_REPOSITORY } from './repositories/service-provider.repository';
import { SERVICE_REQUEST_REPOSITORY } from './repositories/service-request.repository';
import { ServiceProviderDocument, ServiceProviderSchema } from './schemas/service-provider.schema';
import { ServiceRequestDocument, ServiceRequestSchema } from './schemas/service-request.schema';
import { ServiceFeeCalculator } from './services/service-fee-calculator';
import { ServiceRequestPresenter } from './services/service-request-presenter';
import { ApproveServiceProviderUseCase } from './use-cases/approve-service-provider.use-case';
import { CreateServiceRequestUseCase } from './use-cases/create-service-request.use-case';
import { GetServiceProviderProfileUseCase } from './use-cases/get-service-provider-profile.use-case';
import { ListServiceRequestsUseCase } from './use-cases/list-service-requests.use-case';
import { RegisterServiceProviderUseCase } from './use-cases/register-service-provider.use-case';
import { RespondServiceRequestUseCase } from './use-cases/respond-service-request.use-case';
import { SearchServiceProvidersUseCase } from './use-cases/search-service-providers.use-case';
import { UpdateServiceProviderProfileUseCase } from './use-cases/update-service-provider-profile.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServiceProviderDocument.name, schema: ServiceProviderSchema },
      { name: ServiceRequestDocument.name, schema: ServiceRequestSchema },
    ]),
    ProducersModule,
  ],
  controllers: [ServiceProvidersController, ServiceRequestsController],
  providers: [
    { provide: SERVICE_PROVIDER_REPOSITORY, useClass: MongoServiceProviderRepository },
    { provide: SERVICE_REQUEST_REPOSITORY, useClass: MongoServiceRequestRepository },
    ServiceFeeCalculator,
    ServiceRequestPresenter,
    RegisterServiceProviderUseCase,
    ApproveServiceProviderUseCase,
    GetServiceProviderProfileUseCase,
    UpdateServiceProviderProfileUseCase,
    SearchServiceProvidersUseCase,
    CreateServiceRequestUseCase,
    RespondServiceRequestUseCase,
    ListServiceRequestsUseCase,
  ],
  exports: [SERVICE_PROVIDER_REPOSITORY, ServiceFeeCalculator],
})
export class ServiceProvidersModule {}
