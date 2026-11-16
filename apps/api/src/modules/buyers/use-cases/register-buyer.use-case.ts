import { Inject, Injectable } from '@nestjs/common';
import type { AuthSession, RegisterBuyerInput } from '@colheita/contracts';
import { AuthenticatedUser } from '../../../shared/auth/authenticated-user';
import { GrantUserRoleUseCase } from '../../identity/use-cases/grant-user-role.use-case';
import { Buyer } from '../entities/buyer.entity';
import { BUYER_REPOSITORY, BuyerRepository } from '../repositories/buyer.repository';

@Injectable()
export class RegisterBuyerUseCase {
  constructor(
    @Inject(BUYER_REPOSITORY) private readonly buyerRepository: BuyerRepository,
    private readonly grantUserRoleUseCase: GrantUserRoleUseCase,
  ) {}

  async execute(user: AuthenticatedUser, input: RegisterBuyerInput): Promise<AuthSession> {
    const buyer = Buyer.register({
      id: user.userId,
      name: input.name,
      buyerType: input.buyerType,
      document: input.document.replace(/\D/g, ''),
      phoneNumber: user.phoneNumber,
      deliveryLocation: input.deliveryLocation,
      deliveryAddress: input.deliveryAddress,
    });
    await this.buyerRepository.save(buyer);
    return this.grantUserRoleUseCase.execute(user.userId, 'buyer', input.name);
  }
}
