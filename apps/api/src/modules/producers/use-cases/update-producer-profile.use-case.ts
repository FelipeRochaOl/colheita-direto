import { Inject, Injectable } from '@nestjs/common';
import type { AuthSession, UpdateProducerProfileInput } from '@colheita/contracts';
import { EntityNotFoundError } from '../../../shared/errors/domain-error';
import { RenameUserUseCase } from '../../identity/use-cases/rename-user.use-case';
import { PRODUCER_REPOSITORY, ProducerRepository } from '../repositories/producer.repository';

/** "Meus dados" do produtor. O nome novo aparece nas ofertas porque o OfferPresenter lê o perfil atual. */
@Injectable()
export class UpdateProducerProfileUseCase {
  constructor(
    @Inject(PRODUCER_REPOSITORY) private readonly producerRepository: ProducerRepository,
    private readonly renameUserUseCase: RenameUserUseCase,
  ) {}

  async execute(producerId: string, input: UpdateProducerProfileInput): Promise<AuthSession> {
    const producer = await this.producerRepository.findById(producerId);
    if (!producer) throw new EntityNotFoundError('Produtor', producerId);
    producer.updateProfile({ ...input, familyFarmRegistration: input.familyFarmRegistration?.trim() || null });
    await this.producerRepository.save(producer);
    return this.renameUserUseCase.execute(producerId, input.name);
  }
}
