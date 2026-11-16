import type { GeoPoint, QualityGrade } from '@colheita/contracts';
import { Offer } from '../entities/offer.entity';

export const OFFER_REPOSITORY = Symbol('OFFER_REPOSITORY');

export interface OfferSearchCriteria {
  crop?: string;
  grades?: QualityGrade[];
  maxPricePerBox?: number;
  near?: { location: GeoPoint; maxDistanceKm: number };
}

export interface OfferRepository {
  findById(offerId: string): Promise<Offer | null>;
  search(criteria: OfferSearchCriteria): Promise<Offer[]>;
  findActiveByProducer(producerId: string): Promise<Offer[]>;
  save(offer: Offer): Promise<void>;
  /** Reserva atômica: só desconta se houver caixas suficientes. Evita vender a mesma caixa duas vezes. */
  tryReserveBoxes(offerId: string, boxes: number): Promise<boolean>;
  releaseBoxes(offerId: string, boxes: number): Promise<void>;
}
