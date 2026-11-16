import { PriceReference } from '../entities/price-reference.entity';

export const PRICE_REFERENCE_REPOSITORY = Symbol('PRICE_REFERENCE_REPOSITORY');

export interface PriceReferenceRepository {
  findLatestByCrop(normalizedCrop: string): Promise<PriceReference | null>;
  save(priceReference: PriceReference): Promise<void>;
}
