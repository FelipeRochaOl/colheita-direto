import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundError } from '../../../shared/errors/domain-error';
import { ProducerProps } from '../entities/producer.entity';
import { PRODUCER_REPOSITORY, ProducerRepository } from '../repositories/producer.repository';

@Injectable()
export class GetProducerProfileUseCase {
  constructor(@Inject(PRODUCER_REPOSITORY) private readonly producerRepository: ProducerRepository) {}

  async execute(producerId: string): Promise<ProducerProps> {
    const producer = await this.producerRepository.findById(producerId);
    if (!producer) throw new EntityNotFoundError('Produtor', producerId);
    return producer.toSnapshot();
  }
}
