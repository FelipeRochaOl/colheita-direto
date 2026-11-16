import type { GeoPoint, LotDestination, QualityGrade } from '@colheita/contracts';
import { generateEntityId } from '../../../shared/database/entity-id';

export type OfferChannel = Extract<LotDestination, 'MARKETPLACE' | 'DISCOUNT_MARKETPLACE' | 'INDUSTRY'>;

export interface OfferProps {
  id: string;
  harvestLotId: string;
  producerId: string;
  producerName: string;
  crop: string;
  grade: QualityGrade;
  channel: OfferChannel;
  availableBoxes: number;
  boxWeightKg: number;
  pricePerBox: number;
  photoKeys: string[];
  location: GeoPoint;
  city: string;
  state: string;
  isActive: boolean;
  createdAt: Date;
}

/** Oferta publicada a partir de um lote classificado. */
export class Offer {
  private constructor(private readonly props: OfferProps) {}

  static publish(props: Omit<OfferProps, 'id' | 'isActive' | 'createdAt'>): Offer {
    if (props.pricePerBox <= 0) throw new Error('Preço por caixa deve ser positivo');
    return new Offer({ ...props, id: generateEntityId(), isActive: true, createdAt: new Date() });
  }

  static restore(props: OfferProps): Offer {
    return new Offer(props);
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
  get crop() {
    return this.props.crop;
  }
  get pricePerBox() {
    return this.props.pricePerBox;
  }
  get boxWeightKg() {
    return this.props.boxWeightKg;
  }
  get availableBoxes() {
    return this.props.availableBoxes;
  }
  get location() {
    return this.props.location;
  }
  get isActive() {
    return this.props.isActive;
  }

  toSnapshot(): OfferProps {
    return { ...this.props, photoKeys: [...this.props.photoKeys] };
  }
}
