import { Inject, Injectable } from '@nestjs/common';
import type { ServiceRequest as ServiceRequestDto } from '@colheita/contracts';
import { EntityNotFoundError } from '../../../shared/errors/domain-error';
import { SERVICE_REQUEST_REPOSITORY, ServiceRequestRepository } from '../repositories/service-request.repository';
import { ServiceRequestPresenter } from '../services/service-request-presenter';

/** Prestador aceita ou recusa uma solicitação endereçada a ele. */
@Injectable()
export class RespondServiceRequestUseCase {
  constructor(
    @Inject(SERVICE_REQUEST_REPOSITORY) private readonly serviceRequestRepository: ServiceRequestRepository,
    private readonly serviceRequestPresenter: ServiceRequestPresenter,
  ) {}

  async execute(serviceProviderId: string, serviceRequestId: string, accept: boolean): Promise<ServiceRequestDto> {
    const serviceRequest = await this.serviceRequestRepository.findById(serviceRequestId);
    // Solicitação de outro prestador responde como inexistente, sem revelar que existe
    if (!serviceRequest || serviceRequest.serviceProviderId !== serviceProviderId) {
      throw new EntityNotFoundError('Solicitação', serviceRequestId);
    }
    if (accept) serviceRequest.accept();
    else serviceRequest.decline();
    await this.serviceRequestRepository.save(serviceRequest);
    const [presented] = await this.serviceRequestPresenter.present([serviceRequest], serviceProviderId);
    return presented;
  }
}
