import { Inject, Injectable } from '@nestjs/common';
import type { CreateServiceRequestInput, ServiceRequest as ServiceRequestDto } from '@colheita/contracts';
import { generateEntityId } from '../../../shared/database/entity-id';
import { BusinessRuleViolationError, EntityNotFoundError } from '../../../shared/errors/domain-error';
import { calculateDistanceKm } from '../../../shared/geo/geo-distance';
import { PRODUCER_REPOSITORY, ProducerRepository } from '../../producers/repositories/producer.repository';
import { ServiceRequest } from '../entities/service-request.entity';
import { SERVICE_PROVIDER_REPOSITORY, ServiceProviderRepository } from '../repositories/service-provider.repository';
import { SERVICE_REQUEST_REPOSITORY, ServiceRequestRepository } from '../repositories/service-request.repository';
import { ServiceRequestPresenter } from '../services/service-request-presenter';

/** Produtor contrata um serviço: o preço é estimado com a tabela divulgada pelo prestador. */
@Injectable()
export class CreateServiceRequestUseCase {
  constructor(
    @Inject(PRODUCER_REPOSITORY) private readonly producerRepository: ProducerRepository,
    @Inject(SERVICE_PROVIDER_REPOSITORY) private readonly serviceProviderRepository: ServiceProviderRepository,
    @Inject(SERVICE_REQUEST_REPOSITORY) private readonly serviceRequestRepository: ServiceRequestRepository,
    private readonly serviceRequestPresenter: ServiceRequestPresenter,
  ) {}

  async execute(producerId: string, input: CreateServiceRequestInput): Promise<ServiceRequestDto> {
    const producer = await this.producerRepository.findById(producerId);
    if (!producer) throw new EntityNotFoundError('Produtor', producerId);
    const serviceProvider = await this.serviceProviderRepository.findById(input.serviceProviderId);
    if (!serviceProvider) throw new EntityNotFoundError('Prestador', input.serviceProviderId);

    if (serviceProvider.id === producerId) {
      throw new BusinessRuleViolationError('Você não pode contratar o seu próprio serviço');
    }
    if (!serviceProvider.canReceiveOrders()) {
      throw new BusinessRuleViolationError('Este prestador ainda não foi aprovado');
    }
    const estimatedTotal = serviceProvider.estimatePrice(input.serviceType, input.quantity);
    if (!serviceProvider.offers(input.serviceType) || estimatedTotal === null) {
      throw new BusinessRuleViolationError('Este prestador não oferece esse serviço');
    }
    if (calculateDistanceKm(serviceProvider.baseLocation, producer.farmLocation) > serviceProvider.serviceRadiusKm) {
      throw new BusinessRuleViolationError('Sua fazenda está fora do raio de atendimento deste prestador');
    }

    const serviceRequest = ServiceRequest.create({
      id: generateEntityId(),
      producerId,
      serviceProviderId: serviceProvider.id,
      serviceType: input.serviceType,
      quantity: input.quantity,
      estimatedTotal,
      scheduledFor: input.scheduledFor ?? null,
      notes: input.notes?.trim() || null,
      pickupLocation: producer.farmLocation,
    });
    await this.serviceRequestRepository.save(serviceRequest);
    const [presented] = await this.serviceRequestPresenter.present([serviceRequest], producerId);
    return presented;
  }
}
