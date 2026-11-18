import { Inject, Injectable } from '@nestjs/common';
import type { NgoProfile } from '@colheita/contracts';
import { EntityNotFoundError } from '../../../shared/errors/domain-error';
import { NGO_REPOSITORY, NgoRepository } from '../repositories/ngo.repository';

@Injectable()
export class GetNgoProfileUseCase {
  constructor(@Inject(NGO_REPOSITORY) private readonly ngoRepository: NgoRepository) {}

  async execute(ngoId: string): Promise<NgoProfile> {
    const ngo = await this.ngoRepository.findById(ngoId);
    if (!ngo) throw new EntityNotFoundError('ONG', ngoId);
    const { id, name, document, phoneNumber, location, address, pickupRadiusKm, isApproved } = ngo.toSnapshot();
    return { id, name, document, phoneNumber, location, address, pickupRadiusKm, isApproved };
  }
}
