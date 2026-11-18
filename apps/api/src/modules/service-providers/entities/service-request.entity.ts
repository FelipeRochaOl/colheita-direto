import type { GeoPoint, ServiceRequestStatus, ServiceType } from '@colheita/contracts';
import { BusinessRuleViolationError } from '../../../shared/errors/domain-error';

export interface ServiceRequestProps {
  id: string;
  producerId: string;
  serviceProviderId: string;
  serviceType: ServiceType;
  quantity: number;
  /** Preço calculado no momento da solicitação, com a tabela que o prestador divulgava então. */
  estimatedTotal: number;
  scheduledFor: string | null;
  notes: string | null;
  pickupLocation: GeoPoint;
  status: ServiceRequestStatus;
  createdAt: Date;
  respondedAt: Date | null;
}

/** Solicitação de serviço do produtor a um prestador. O pagamento é combinado entre os dois. */
export class ServiceRequest {
  private constructor(private readonly props: ServiceRequestProps) {}

  static create(props: Omit<ServiceRequestProps, 'status' | 'createdAt' | 'respondedAt'>): ServiceRequest {
    return new ServiceRequest({ ...props, status: 'REQUESTED', createdAt: new Date(), respondedAt: null });
  }

  static restore(props: ServiceRequestProps): ServiceRequest {
    return new ServiceRequest(props);
  }

  get id() {
    return this.props.id;
  }
  get producerId() {
    return this.props.producerId;
  }
  get serviceProviderId() {
    return this.props.serviceProviderId;
  }
  get status() {
    return this.props.status;
  }

  accept(): void {
    this.respond('ACCEPTED');
  }

  decline(): void {
    this.respond('DECLINED');
  }

  private respond(status: Extract<ServiceRequestStatus, 'ACCEPTED' | 'DECLINED'>): void {
    if (this.props.status !== 'REQUESTED') {
      throw new BusinessRuleViolationError('Esta solicitação já foi respondida');
    }
    this.props.status = status;
    this.props.respondedAt = new Date();
  }

  toSnapshot(): ServiceRequestProps {
    return { ...this.props, pickupLocation: { ...this.props.pickupLocation } };
  }
}
