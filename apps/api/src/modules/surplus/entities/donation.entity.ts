import type { DonationStatus, GeoPoint } from '@colheita/contracts';
import { generateEntityId } from '../../../shared/database/entity-id';
import { BusinessRuleViolationError } from '../../../shared/errors/domain-error';

export interface DonationProps {
  id: string;
  harvestLotId: string;
  producerId: string;
  producerName: string;
  crop: string;
  quantityBoxes: number;
  estimatedWeightKg: number;
  pickupLocation: GeoPoint;
  status: DonationStatus;
  ngoId: string | null;
  receivedWeightKg: number | null;
  acceptedAt: Date | null;
  receivedAt: Date | null;
  createdAt: Date;
}

/** Doação de um lote para ONG/banco de alimentos, com comprovante de recebimento (KPI de impacto). */
export class Donation {
  private constructor(private readonly props: DonationProps) {}

  static offer(
    props: Omit<DonationProps, 'id' | 'status' | 'ngoId' | 'receivedWeightKg' | 'acceptedAt' | 'receivedAt' | 'createdAt'>,
  ): Donation {
    return new Donation({
      ...props,
      id: generateEntityId(),
      status: 'OFFERED',
      ngoId: null,
      receivedWeightKg: null,
      acceptedAt: null,
      receivedAt: null,
      createdAt: new Date(),
    });
  }

  static restore(props: DonationProps): Donation {
    return new Donation(props);
  }

  get id() {
    return this.props.id;
  }
  get harvestLotId() {
    return this.props.harvestLotId;
  }
  get producerId() {
    return this.props.producerId;
  }
  get status() {
    return this.props.status;
  }

  acceptBy(ngoId: string): void {
    if (this.props.status !== 'OFFERED') throw new BusinessRuleViolationError('Doação não está mais disponível');
    this.props.ngoId = ngoId;
    this.props.status = 'ACCEPTED';
    this.props.acceptedAt = new Date();
  }

  confirmReceipt(ngoId: string, receivedWeightKg: number): void {
    if (this.props.ngoId !== ngoId) throw new BusinessRuleViolationError('Doação aceita por outra organização');
    if (this.props.status !== 'ACCEPTED' && this.props.status !== 'PICKED_UP') {
      throw new BusinessRuleViolationError('Doação ainda não foi aceita');
    }
    this.props.receivedWeightKg = receivedWeightKg;
    this.props.status = 'RECEIVED';
    this.props.receivedAt = new Date();
  }

  toSnapshot(): DonationProps {
    return { ...this.props };
  }
}
