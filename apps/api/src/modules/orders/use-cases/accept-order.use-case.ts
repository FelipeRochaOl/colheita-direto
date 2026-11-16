import { Inject, Injectable } from '@nestjs/common';
import type { Order as OrderView } from '@colheita/contracts';
import { EntityNotFoundError } from '../../../shared/errors/domain-error';
import { ORDER_REPOSITORY, OrderRepository } from '../repositories/order.repository';
import { OrderPresenter } from '../services/order-presenter';

@Injectable()
export class AcceptOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orderRepository: OrderRepository,
    private readonly orderPresenter: OrderPresenter,
  ) {}

  async execute(producerId: string, orderId: string): Promise<OrderView> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new EntityNotFoundError('Pedido', orderId);
    order.acceptByProducer(producerId);
    await this.orderRepository.save(order);
    return this.orderPresenter.present(order);
  }
}
