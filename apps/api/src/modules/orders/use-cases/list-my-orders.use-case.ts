import { Inject, Injectable } from '@nestjs/common';
import type { Order as OrderView } from '@colheita/contracts';
import { ORDER_REPOSITORY, OrderRepository } from '../repositories/order.repository';
import { OrderPresenter } from '../services/order-presenter';

@Injectable()
export class ListMyOrdersUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orderRepository: OrderRepository,
    private readonly orderPresenter: OrderPresenter,
  ) {}

  async execute(userId: string): Promise<OrderView[]> {
    const orders = await this.orderRepository.findByParticipant(userId);
    return orders.map((order) => this.orderPresenter.present(order));
  }
}
