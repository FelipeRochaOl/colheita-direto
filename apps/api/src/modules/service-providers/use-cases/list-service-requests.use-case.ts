import { Inject, Injectable } from '@nestjs/common';
import type { ServiceRequestBoard } from '@colheita/contracts';
import { SERVICE_REQUEST_REPOSITORY, ServiceRequestRepository } from '../repositories/service-request.repository';
import { ServiceRequestPresenter } from '../services/service-request-presenter';

/** Solicitações enviadas (como produtor) e recebidas (como prestador) pelo usuário. */
@Injectable()
export class ListServiceRequestsUseCase {
  constructor(
    @Inject(SERVICE_REQUEST_REPOSITORY) private readonly serviceRequestRepository: ServiceRequestRepository,
    private readonly serviceRequestPresenter: ServiceRequestPresenter,
  ) {}

  async execute(userId: string): Promise<ServiceRequestBoard> {
    const serviceRequests = await this.serviceRequestRepository.findByParticipant(userId);
    const presented = await this.serviceRequestPresenter.present(serviceRequests, userId);
    return {
      sent: presented.filter((request) => request.producerId === userId),
      received: presented.filter((request) => request.serviceProviderId === userId),
    };
  }
}
