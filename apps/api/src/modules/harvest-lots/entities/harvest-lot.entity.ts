import type { HarvestLotStatus, LotClassification, LotDestination } from '@colheita/contracts';
import { generateEntityId } from '../../../shared/database/entity-id';
import { BusinessRuleViolationError } from '../../../shared/errors/domain-error';

/** Abaixo desta confiança a classificação precisa de confirmação humana. */
export const MINIMUM_CLASSIFICATION_CONFIDENCE = 0.7;

export interface HarvestLotProps {
  id: string;
  producerId: string;
  crop: string;
  quantityBoxes: number;
  boxWeightKg: number;
  photoKeys: string[];
  status: HarvestLotStatus;
  classification: LotClassification | null;
  recommendedDestination: LotDestination | null;
  destination: LotDestination | null;
  suggestedPricePerBox: number | null;
  harvestedAt: Date;
  classifiedAt: Date | null;
  createdAt: Date;
}

/** Lote de colheita fotografado pelo produtor. A classificação A–D decide o destino. */
export class HarvestLot {
  private constructor(private readonly props: HarvestLotProps) {}

  static create(input: {
    producerId: string;
    crop: string;
    quantityBoxes: number;
    boxWeightKg: number;
    photoKeys: string[];
    harvestedAt: Date;
  }): HarvestLot {
    return new HarvestLot({
      id: generateEntityId(),
      ...input,
      crop: input.crop.trim().toLowerCase(),
      status: 'PENDING_CLASSIFICATION',
      classification: null,
      recommendedDestination: null,
      destination: null,
      suggestedPricePerBox: null,
      classifiedAt: null,
      createdAt: new Date(),
    });
  }

  static restore(props: HarvestLotProps): HarvestLot {
    return new HarvestLot(props);
  }

  get id() {
    return this.props.id;
  }
  get producerId() {
    return this.props.producerId;
  }
  get crop() {
    return this.props.crop;
  }
  get quantityBoxes() {
    return this.props.quantityBoxes;
  }
  get boxWeightKg() {
    return this.props.boxWeightKg;
  }
  get photoKeys() {
    return [...this.props.photoKeys];
  }
  get status() {
    return this.props.status;
  }
  get classification() {
    return this.props.classification;
  }
  get recommendedDestination() {
    return this.props.recommendedDestination;
  }
  get suggestedPricePerBox() {
    return this.props.suggestedPricePerBox;
  }

  get totalWeightKg(): number {
    return this.props.quantityBoxes * this.props.boxWeightKg;
  }

  isOwnedBy(producerId: string): boolean {
    return this.props.producerId === producerId;
  }

  applyClassification(
    classification: LotClassification,
    recommendedDestination: LotDestination,
    suggestedPricePerBox: number | null,
  ): void {
    if (this.props.status !== 'PENDING_CLASSIFICATION') {
      throw new BusinessRuleViolationError('Lote já foi classificado');
    }
    this.props.classification = classification;
    this.props.recommendedDestination = recommendedDestination;
    this.props.suggestedPricePerBox = suggestedPricePerBox;
    this.props.classifiedAt = new Date();
    this.props.status =
      classification.confidence >= MINIMUM_CLASSIFICATION_CONFIDENCE ? 'CLASSIFIED' : 'NEEDS_REVIEW';
  }

  /** Confirmação do produtor (app ou WhatsApp). Define o status conforme o destino escolhido. */
  confirmDestination(destination: LotDestination): void {
    if (this.props.status !== 'CLASSIFIED' && this.props.status !== 'NEEDS_REVIEW') {
      throw new BusinessRuleViolationError('O destino só pode ser definido depois da classificação');
    }
    this.props.destination = destination;
    this.props.status = HarvestLot.statusForDestination(destination);
  }

  markSold(): void {
    this.props.status = 'SOLD';
  }

  markDonated(): void {
    this.props.status = 'DONATED';
  }

  toSnapshot(): HarvestLotProps {
    return { ...this.props, photoKeys: [...this.props.photoKeys] };
  }

  private static statusForDestination(destination: LotDestination): HarvestLotStatus {
    switch (destination) {
      case 'MARKETPLACE':
      case 'DISCOUNT_MARKETPLACE':
      case 'INDUSTRY':
      case 'AUCTION':
        return 'LISTED';
      case 'DONATION':
        return 'DONATION_OFFERED';
      case 'ANIMAL_FEED':
      case 'COMPOST':
        return 'DISCARDED';
    }
  }
}
