import type { GeoPoint } from '@colheita/contracts';
import { Ngo } from '../entities/ngo.entity';

export const NGO_REPOSITORY = Symbol('NGO_REPOSITORY');

export interface NgoRepository {
  findById(ngoId: string): Promise<Ngo | null>;
  findApprovedNear(location: GeoPoint, maxDistanceKm: number): Promise<Ngo[]>;
  save(ngo: Ngo): Promise<void>;
}
