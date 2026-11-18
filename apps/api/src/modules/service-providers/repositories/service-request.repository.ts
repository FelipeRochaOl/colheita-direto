import { ServiceRequest } from '../entities/service-request.entity';

export const SERVICE_REQUEST_REPOSITORY = Symbol('SERVICE_REQUEST_REPOSITORY');

export interface ServiceRequestRepository {
  findById(serviceRequestId: string): Promise<ServiceRequest | null>;
  /** Solicitações em que o usuário é o produtor ou o prestador, das mais novas para as mais antigas. */
  findByParticipant(userId: string): Promise<ServiceRequest[]>;
  save(serviceRequest: ServiceRequest): Promise<void>;
}
