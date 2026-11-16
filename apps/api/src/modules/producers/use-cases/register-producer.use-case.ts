import { Inject, Injectable } from '@nestjs/common';
import type { AuthSession, RegisterProducerInput } from '@colheita/contracts';
import { GrantUserRoleUseCase } from '../../identity/use-cases/grant-user-role.use-case';
import { Producer } from '../entities/producer.entity';
import { PRODUCER_REPOSITORY, ProducerRepository } from '../repositories/producer.repository';

@Injectable()
export class RegisterProducerUseCase {
  constructor(
    @Inject(PRODUCER_REPOSITORY) private readonly producerRepository: ProducerRepository,
    private readonly grantUserRoleUseCase: GrantUserRoleUseCase,
  ) {}

  async execute(userId: string, input: RegisterProducerInput): Promise<AuthSession> {
    const producer = Producer.register({
      id: userId,
      name: input.name,
      farmName: input.farmName,
      farmLocation: input.farmLocation,
      city: input.city,
      state: input.state.toUpperCase(),
      crops: input.crops,
      familyFarmRegistration: input.familyFarmRegistration ?? null,
    });
    await this.producerRepository.save(producer);
    return this.grantUserRoleUseCase.execute(userId, 'producer', input.name);
  }
}
