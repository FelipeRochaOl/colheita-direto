import { Inject, Injectable } from '@nestjs/common';
import type { ServiceRequest as ServiceRequestDto } from '@colheita/contracts';
import { USER_REPOSITORY, UserRepository } from '../../identity/repositories/user.repository';
import { PRODUCER_REPOSITORY, ProducerRepository } from '../../producers/repositories/producer.repository';
import { ServiceRequest } from '../entities/service-request.entity';
import { SERVICE_PROVIDER_REPOSITORY, ServiceProviderRepository } from '../repositories/service-provider.repository';

/** Monta a solicitação para a tela, com os nomes atuais e o celular da outra parte depois do aceite. */
@Injectable()
export class ServiceRequestPresenter {
  constructor(
    @Inject(PRODUCER_REPOSITORY) private readonly producerRepository: ProducerRepository,
    @Inject(SERVICE_PROVIDER_REPOSITORY) private readonly serviceProviderRepository: ServiceProviderRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async present(serviceRequests: ServiceRequest[], viewerId: string): Promise<ServiceRequestDto[]> {
    const producerIds = [...new Set(serviceRequests.map((request) => request.producerId))];
    const serviceProviderIds = [...new Set(serviceRequests.map((request) => request.serviceProviderId))];
    const [producers, serviceProviders, producerUsers] = await Promise.all([
      this.producerRepository.findManyByIds(producerIds),
      Promise.all(serviceProviderIds.map((id) => this.serviceProviderRepository.findById(id))),
      Promise.all(producerIds.map((id) => this.userRepository.findById(id))),
    ]);
    const producerNames = new Map(producers.map((producer) => [producer.id, producer.name]));
    const providersById = new Map(serviceProviders.flatMap((provider) => (provider ? [[provider.id, provider]] : [])));
    const producerPhones = new Map(producerUsers.flatMap((user) => (user ? [[user.id, user.phoneNumber]] : [])));

    return serviceRequests.map((serviceRequest) => {
      const snapshot = serviceRequest.toSnapshot();
      const serviceProvider = providersById.get(snapshot.serviceProviderId);
      const viewerIsProducer = viewerId === snapshot.producerId;
      const counterpartPhoneNumber =
        snapshot.status === 'ACCEPTED'
          ? ((viewerIsProducer ? serviceProvider?.phoneNumber : producerPhones.get(snapshot.producerId)) ?? null)
          : null;
      return {
        id: snapshot.id,
        producerId: snapshot.producerId,
        producerName: producerNames.get(snapshot.producerId) ?? 'Produtor',
        serviceProviderId: snapshot.serviceProviderId,
        serviceProviderName: serviceProvider?.name ?? 'Prestador',
        serviceType: snapshot.serviceType,
        quantity: snapshot.quantity,
        estimatedTotal: snapshot.estimatedTotal,
        scheduledFor: snapshot.scheduledFor,
        notes: snapshot.notes,
        pickupLocation: snapshot.pickupLocation,
        status: snapshot.status,
        counterpartPhoneNumber,
        createdAt: snapshot.createdAt.toISOString(),
      };
    });
  }
}
