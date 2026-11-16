import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundError } from '../../../shared/errors/domain-error';
import { DonationProps } from '../entities/donation.entity';
import { DONATION_REPOSITORY, DonationRepository } from '../repositories/donation.repository';
import { NGO_REPOSITORY, NgoRepository } from '../repositories/ngo.repository';

@Injectable()
export class ListAvailableDonationsUseCase {
  constructor(
    @Inject(DONATION_REPOSITORY) private readonly donationRepository: DonationRepository,
    @Inject(NGO_REPOSITORY) private readonly ngoRepository: NgoRepository,
  ) {}

  async execute(ngoId: string): Promise<{ available: DonationProps[]; accepted: DonationProps[] }> {
    const ngo = await this.ngoRepository.findById(ngoId);
    if (!ngo) throw new EntityNotFoundError('ONG', ngoId);
    const [available, accepted] = await Promise.all([
      ngo.isApproved ? this.donationRepository.findOfferedNear(ngo.location, ngo.pickupRadiusKm) : Promise.resolve([]),
      this.donationRepository.findByNgo(ngoId),
    ]);
    return {
      available: available.map((donation) => donation.toSnapshot()),
      accepted: accepted.map((donation) => donation.toSnapshot()),
    };
  }
}
