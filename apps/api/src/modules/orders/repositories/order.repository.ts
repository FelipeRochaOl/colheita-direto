import { Order } from '../entities/order.entity';

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');

export interface SalesTotals {
  kilogramsSold: number;
  revenueToProducers: number;
  averageHoursToSale: number | null;
}

export interface OrderRepository {
  findById(orderId: string): Promise<Order | null>;
  findByParticipant(userId: string): Promise<Order[]>;
  save(order: Order): Promise<void>;
  calculateSalesTotals(): Promise<SalesTotals>;
}
