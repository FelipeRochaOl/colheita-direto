import { Inject, Injectable } from '@nestjs/common';
import type { ServiceProviderProfile } from '@colheita/contracts';
import { EntityNotFoundError } from '../../../shared/errors/domain-error';
import { SERVICE_PROVIDER_REPOSITORY, ServiceProviderRepository } from '../repositories/service-provider.repository';

@Injectable()
export class GetServiceProviderProfileUseCase {
  constructor(
    @Inject(SERVICE_PROVIDER_REPOSITORY) private readonly serviceProviderRepository: ServiceProviderRepository,
  ) {}

  async execute(serviceProviderId: string): Promise<ServiceProviderProfile> {
    const serviceProvider = await this.serviceProviderRepository.findById(serviceProviderId);
    if (!serviceProvider) throw new EntityNotFoundError('Prestador', serviceProviderId);
    const snapshot = serviceProvider.toSnapshot();
    return {
      id: snapshot.id,
      name: snapshot.name,
      document: snapshot.document,
      phoneNumber: snapshot.phoneNumber,
      isApproved: snapshot.isApproved,
      offerings: snapshot.offerings.map(({ description, ...offering }) => ({
        ...offering,
        ...(description ? { description } : {}),
      })),
      baseLocation: snapshot.baseLocation,
      serviceRadiusKm: snapshot.serviceRadiusKm,
      vehicleCapacityKg: snapshot.vehicleCapacityKg,
      hasRefrigeration: snapshot.hasRefrigeration,
    };
  }
}
