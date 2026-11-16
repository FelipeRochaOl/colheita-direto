import { Inject, Injectable } from '@nestjs/common';
import type { AuthSession, RegisterNgoInput } from '@colheita/contracts';
import { AuthenticatedUser } from '../../../shared/auth/authenticated-user';
import { GrantUserRoleUseCase } from '../../identity/use-cases/grant-user-role.use-case';
import { Ngo } from '../entities/ngo.entity';
import { NGO_REPOSITORY, NgoRepository } from '../repositories/ngo.repository';

@Injectable()
export class RegisterNgoUseCase {
  constructor(
    @Inject(NGO_REPOSITORY) private readonly ngoRepository: NgoRepository,
    private readonly grantUserRoleUseCase: GrantUserRoleUseCase,
  ) {}

  async execute(user: AuthenticatedUser, input: RegisterNgoInput): Promise<AuthSession> {
    const ngo = Ngo.register({
      id: user.userId,
      name: input.name,
      document: input.document.replace(/\D/g, ''),
      phoneNumber: user.phoneNumber,
      location: input.location,
      address: input.address,
      pickupRadiusKm: input.pickupRadiusKm,
    });
    await this.ngoRepository.save(ngo);
    return this.grantUserRoleUseCase.execute(user.userId, 'ngo', input.name);
  }
}
