import type { GeoPoint } from '@colheita/contracts';
import { Donation } from '../entities/donation.entity';

export const DONATION_REPOSITORY = Symbol('DONATION_REPOSITORY');

export interface DonationRepository {
  findById(donationId: string): Promise<Donation | null>;
  findOfferedNear(location: GeoPoint, maxDistanceKm: number): Promise<Donation[]>;
  findByNgo(ngoId: string): Promise<Donation[]>;
  save(donation: Donation): Promise<void>;
  sumReceivedWeightKg(): Promise<number>;
}
