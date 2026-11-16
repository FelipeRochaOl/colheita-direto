import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundError } from '../../../shared/errors/domain-error';
import { NGO_REPOSITORY, NgoRepository } from '../repositories/ngo.repository';

@Injectable()
export class ApproveNgoUseCase {
  constructor(@Inject(NGO_REPOSITORY) private readonly ngoRepository: NgoRepository) {}

  async execute(ngoId: string): Promise<void> {
    const ngo = await this.ngoRepository.findById(ngoId);
    if (!ngo) throw new EntityNotFoundError('ONG', ngoId);
    ngo.approve();
    await this.ngoRepository.save(ngo);
  }
}
