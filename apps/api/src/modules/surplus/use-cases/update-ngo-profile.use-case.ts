import { Inject, Injectable } from '@nestjs/common';
import type { AuthSession, UpdateNgoProfileInput } from '@colheita/contracts';
import { EntityNotFoundError } from '../../../shared/errors/domain-error';
import { RenameUserUseCase } from '../../identity/use-cases/rename-user.use-case';
import { NGO_REPOSITORY, NgoRepository } from '../repositories/ngo.repository';

@Injectable()
export class UpdateNgoProfileUseCase {
  constructor(
    @Inject(NGO_REPOSITORY) private readonly ngoRepository: NgoRepository,
    private readonly renameUserUseCase: RenameUserUseCase,
  ) {}

  async execute(ngoId: string, input: UpdateNgoProfileInput): Promise<AuthSession> {
    const ngo = await this.ngoRepository.findById(ngoId);
    if (!ngo) throw new EntityNotFoundError('ONG', ngoId);
    ngo.updateProfile(input);
    await this.ngoRepository.save(ngo);
    return this.renameUserUseCase.execute(ngoId, input.name);
  }
}
