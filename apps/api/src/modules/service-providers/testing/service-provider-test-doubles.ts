import type { GeoPoint, ServiceType } from '@colheita/contracts';
import { calculateDistanceKm } from '../../../shared/geo/geo-distance';
import { Producer } from '../../producers/entities/producer.entity';
import { ProducerRepository } from '../../producers/repositories/producer.repository';
import { ServiceProvider } from '../entities/service-provider.entity';
import { ServiceRequest } from '../entities/service-request.entity';
import { ServiceProviderRepository } from '../repositories/service-provider.repository';
import { ServiceRequestRepository } from '../repositories/service-request.repository';

/** Dublês em memória para os testes do módulo (sem Mongo nem rede). */
export class InMemoryServiceProviderRepository implements ServiceProviderRepository {
  readonly serviceProviders = new Map<string, ServiceProvider>();
  async findById(id: string) {
    return this.serviceProviders.get(id) ?? null;
  }
  async findApprovedServingLocation(serviceType: ServiceType, location: GeoPoint) {
    return [...this.serviceProviders.values()].filter((provider) => {
      const snapshot = provider.toSnapshot();
      return (
        snapshot.isApproved &&
        provider.offers(serviceType) &&
        calculateDistanceKm(snapshot.baseLocation, location) <= snapshot.serviceRadiusKm
      );
    });
  }
  async save(provider: ServiceProvider) {
    this.serviceProviders.set(provider.id, provider);
  }
}

export class InMemoryServiceRequestRepository implements ServiceRequestRepository {
  readonly serviceRequests = new Map<string, ServiceRequest>();
  async findById(id: string) {
    return this.serviceRequests.get(id) ?? null;
  }
  async findByParticipant(userId: string) {
    return [...this.serviceRequests.values()].filter(
      (request) => request.producerId === userId || request.serviceProviderId === userId,
    );
  }
  async save(request: ServiceRequest) {
    this.serviceRequests.set(request.id, request);
  }
}

export class InMemoryProducerRepository implements ProducerRepository {
  readonly producers = new Map<string, Producer>();
  async findById(id: string) {
    return this.producers.get(id) ?? null;
  }
  async findManyByIds(ids: string[]) {
    return ids.flatMap((id) => this.producers.get(id) ?? []);
  }
  async save(producer: Producer) {
    this.producers.set(producer.id, producer);
  }
  async countAll() {
    return this.producers.size;
  }
}

/** Fazenda em Mogi das Cruzes; ~0,1° de latitude ≈ 11 km. */
export const FARM_LOCATION: GeoPoint = { latitude: -23.5, longitude: -46.2 };

export function buildProducer(id = 'producer-1') {
  return Producer.register({
    id,
    name: 'João',
    farmName: 'Sítio Boa Vista',
    farmLocation: FARM_LOCATION,
    city: 'Mogi das Cruzes',
    state: 'SP',
    crops: ['tomate'],
    familyFarmRegistration: null,
  });
}

export function buildTransporter({
  id = 'provider-1',
  baseLocation = { latitude: -23.86, longitude: -46.2 },
  serviceRadiusKm = 80,
  approved = true,
  withPrice = true,
}: {
  id?: string;
  baseLocation?: GeoPoint;
  serviceRadiusKm?: number;
  approved?: boolean;
  withPrice?: boolean;
} = {}) {
  const provider = ServiceProvider.register({
    id,
    name: `Transportes ${id}`,
    document: '12345678000190',
    phoneNumber: '+5511988887777',
    serviceTypes: ['TRANSPORT'],
    baseLocation,
    serviceRadiusKm,
    vehicleCapacityKg: 3000,
    hasRefrigeration: false,
  });
  if (withPrice) {
    provider.updateProfile({
      name: provider.name,
      offerings: [{ serviceType: 'TRANSPORT', price: 2.5, baseFee: 30, description: null }],
      baseLocation,
      serviceRadiusKm,
      vehicleCapacityKg: 3000,
      hasRefrigeration: false,
    });
  }
  if (approved) provider.approve();
  return provider;
}
