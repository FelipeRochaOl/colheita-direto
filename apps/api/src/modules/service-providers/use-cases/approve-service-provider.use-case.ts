import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundError } from '../../../shared/errors/domain-error';
import { SERVICE_PROVIDER_REPOSITORY, ServiceProviderRepository } from '../repositories/service-provider.repository';

@Injectable()
export class ApproveServiceProviderUseCase {
  constructor(
    @Inject(SERVICE_PROVIDER_REPOSITORY) private readonly serviceProviderRepository: ServiceProviderRepository,
  ) {}

  async execute(serviceProviderId: string): Promise<void> {
    const serviceProvider = await this.serviceProviderRepository.findById(serviceProviderId);
    if (!serviceProvider) throw new EntityNotFoundError('Prestador', serviceProviderId);
    serviceProvider.approve();
    await this.serviceProviderRepository.save(serviceProvider);
  }
}
