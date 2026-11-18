import { Inject, Injectable } from '@nestjs/common';
import type { AuthSession, UpdateBuyerProfileInput } from '@colheita/contracts';
import { EntityNotFoundError } from '../../../shared/errors/domain-error';
import { RenameUserUseCase } from '../../identity/use-cases/rename-user.use-case';
import { BUYER_REPOSITORY, BuyerRepository } from '../repositories/buyer.repository';

@Injectable()
export class UpdateBuyerProfileUseCase {
  constructor(
    @Inject(BUYER_REPOSITORY) private readonly buyerRepository: BuyerRepository,
    private readonly renameUserUseCase: RenameUserUseCase,
  ) {}

  async execute(buyerId: string, input: UpdateBuyerProfileInput): Promise<AuthSession> {
    const buyer = await this.buyerRepository.findById(buyerId);
    if (!buyer) throw new EntityNotFoundError('Comprador', buyerId);
    buyer.updateProfile(input);
    await this.buyerRepository.save(buyer);
    return this.renameUserUseCase.execute(buyerId, input.name);
  }
}
