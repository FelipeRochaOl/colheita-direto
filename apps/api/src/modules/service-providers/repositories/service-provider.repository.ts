import type { GeoPoint, ServiceType } from '@colheita/contracts';
import { ServiceProvider } from '../entities/service-provider.entity';

export const SERVICE_PROVIDER_REPOSITORY = Symbol('SERVICE_PROVIDER_REPOSITORY');

export interface ServiceProviderRepository {
  findById(serviceProviderId: string): Promise<ServiceProvider | null>;
  /** Prestadores aprovados que oferecem o serviço e atendem o ponto informado, do mais próximo ao mais distante. */
  findApprovedServingLocation(serviceType: ServiceType, location: GeoPoint): Promise<ServiceProvider[]>;
  save(serviceProvider: ServiceProvider): Promise<void>;
}
