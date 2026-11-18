import { Inject, Injectable } from '@nestjs/common';
import type { AuthSession, UpdateServiceProviderProfileInput } from '@colheita/contracts';
import { EntityNotFoundError } from '../../../shared/errors/domain-error';
import { RenameUserUseCase } from '../../identity/use-cases/rename-user.use-case';
import { SERVICE_PROVIDER_REPOSITORY, ServiceProviderRepository } from '../repositories/service-provider.repository';

/** "Meus serviços": o prestador divulga serviços, preços, raio e base de operação. */
@Injectable()
export class UpdateServiceProviderProfileUseCase {
  constructor(
    @Inject(SERVICE_PROVIDER_REPOSITORY) private readonly serviceProviderRepository: ServiceProviderRepository,
    private readonly renameUserUseCase: RenameUserUseCase,
  ) {}

  async execute(serviceProviderId: string, input: UpdateServiceProviderProfileInput): Promise<AuthSession> {
    const serviceProvider = await this.serviceProviderRepository.findById(serviceProviderId);
    if (!serviceProvider) throw new EntityNotFoundError('Prestador', serviceProviderId);
    serviceProvider.updateProfile({
      name: input.name,
      offerings: input.offerings.map((offering) => ({
        serviceType: offering.serviceType,
        price: offering.price,
        baseFee: offering.serviceType === 'TRANSPORT' ? (offering.baseFee ?? 0) : 0,
        description: offering.description?.trim() || null,
      })),
      baseLocation: input.baseLocation,
      serviceRadiusKm: input.serviceRadiusKm,
      vehicleCapacityKg: input.vehicleCapacityKg ?? null,
      hasRefrigeration: input.hasRefrigeration ?? false,
    });
    await this.serviceProviderRepository.save(serviceProvider);
    return this.renameUserUseCase.execute(serviceProviderId, input.name);
  }
}
