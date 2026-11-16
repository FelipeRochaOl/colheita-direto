import { Buyer } from '../entities/buyer.entity';

export const BUYER_REPOSITORY = Symbol('BUYER_REPOSITORY');

export interface BuyerRepository {
  findById(buyerId: string): Promise<Buyer | null>;
  save(buyer: Buyer): Promise<void>;
}
