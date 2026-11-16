import { Producer } from '../entities/producer.entity';

export const PRODUCER_REPOSITORY = Symbol('PRODUCER_REPOSITORY');

export interface ProducerRepository {
  findById(producerId: string): Promise<Producer | null>;
  findManyByIds(producerIds: string[]): Promise<Producer[]>;
  save(producer: Producer): Promise<void>;
  countAll(): Promise<number>;
}
