import { Inject, Injectable } from '@nestjs/common';
import type { AuthSession, RegisterServiceProviderInput } from '@colheita/contracts';
import { AuthenticatedUser } from '../../../shared/auth/authenticated-user';
import { GrantUserRoleUseCase } from '../../identity/use-cases/grant-user-role.use-case';
import { ServiceProvider } from '../entities/service-provider.entity';
import { SERVICE_PROVIDER_REPOSITORY, ServiceProviderRepository } from '../repositories/service-provider.repository';

@Injectable()
export class RegisterServiceProviderUseCase {
  constructor(
    @Inject(SERVICE_PROVIDER_REPOSITORY) private readonly serviceProviderRepository: ServiceProviderRepository,
    private readonly grantUserRoleUseCase: GrantUserRoleUseCase,
  ) {}

  async execute(user: AuthenticatedUser, input: RegisterServiceProviderInput): Promise<AuthSession> {
    const serviceProvider = ServiceProvider.register({
      id: user.userId,
      name: input.name,
      document: input.document.replace(/\D/g, ''),
      phoneNumber: user.phoneNumber,
      serviceTypes: input.serviceTypes,
      baseLocation: input.baseLocation,
      serviceRadiusKm: input.serviceRadiusKm,
      vehicleCapacityKg: input.vehicleCapacityKg ?? null,
      hasRefrigeration: input.hasRefrigeration,
    });
    await this.serviceProviderRepository.save(serviceProvider);
    return this.grantUserRoleUseCase.execute(user.userId, 'service_provider', input.name);
  }
}
