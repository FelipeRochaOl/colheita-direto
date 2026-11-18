import { Inject, Injectable } from '@nestjs/common';
import type { AvailableServiceProvider, SearchServiceProvidersInput } from '@colheita/contracts';
import { EntityNotFoundError } from '../../../shared/errors/domain-error';
import { calculateDistanceKm } from '../../../shared/geo/geo-distance';
import { PRODUCER_REPOSITORY, ProducerRepository } from '../../producers/repositories/producer.repository';
import { SERVICE_PROVIDER_REPOSITORY, ServiceProviderRepository } from '../repositories/service-provider.repository';

/** Prestadores aprovados, com preço divulgado, cujo raio alcança a fazenda — do mais barato ao mais caro. */
@Injectable()
export class SearchServiceProvidersUseCase {
  constructor(
    @Inject(PRODUCER_REPOSITORY) private readonly producerRepository: ProducerRepository,
    @Inject(SERVICE_PROVIDER_REPOSITORY) private readonly serviceProviderRepository: ServiceProviderRepository,
  ) {}

  async execute(producerId: string, input: SearchServiceProvidersInput): Promise<AvailableServiceProvider[]> {
    const producer = await this.producerRepository.findById(producerId);
    if (!producer) throw new EntityNotFoundError('Produtor', producerId);
    const quantity = input.quantity ?? 1;
    const serviceProviders = await this.serviceProviderRepository.findApprovedServingLocation(
      input.serviceType,
      producer.farmLocation,
    );

    return serviceProviders
      .filter((serviceProvider) => serviceProvider.id !== producerId)
      .flatMap((serviceProvider) => {
        const offering = serviceProvider.offeringFor(input.serviceType);
        const estimatedTotal = serviceProvider.estimatePrice(input.serviceType, quantity);
        if (!offering || estimatedTotal === null) return [];
        const snapshot = serviceProvider.toSnapshot();
        return [
          {
            serviceProviderId: serviceProvider.id,
            name: serviceProvider.name,
            serviceType: input.serviceType,
            description: offering.description,
            price: offering.price,
            baseFee: offering.baseFee,
            distanceKm: Math.round(calculateDistanceKm(serviceProvider.baseLocation, producer.farmLocation) * 10) / 10,
            serviceRadiusKm: snapshot.serviceRadiusKm,
            hasRefrigeration: snapshot.hasRefrigeration,
            vehicleCapacityKg: snapshot.vehicleCapacityKg,
            estimatedTotal,
          },
        ];
      })
      .sort((first, second) => first.estimatedTotal - second.estimatedTotal || first.distanceKm - second.distanceKm);
  }
}
