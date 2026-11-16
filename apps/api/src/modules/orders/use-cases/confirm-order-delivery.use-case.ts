import { Inject, Injectable } from '@nestjs/common';
import type { Order as OrderView } from '@colheita/contracts';
import { EntityNotFoundError } from '../../../shared/errors/domain-error';
import { HARVEST_LOT_REPOSITORY, HarvestLotRepository } from '../../harvest-lots/repositories/harvest-lot.repository';
import { OFFER_REPOSITORY, OfferRepository } from '../../marketplace/repositories/offer.repository';
import { ORDER_REPOSITORY, OrderRepository } from '../repositories/order.repository';
import { OrderPresenter } from '../services/order-presenter';

/** O comprador confirma o recebimento. Lote com oferta esgotada passa a VENDIDO. */
@Injectable()
export class ConfirmOrderDeliveryUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orderRepository: OrderRepository,
    @Inject(OFFER_REPOSITORY) private readonly offerRepository: OfferRepository,
    @Inject(HARVEST_LOT_REPOSITORY) private readonly harvestLotRepository: HarvestLotRepository,
    private readonly orderPresenter: OrderPresenter,
  ) {}

  async execute(buyerId: string, orderId: string): Promise<OrderView> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new EntityNotFoundError('Pedido', orderId);
    order.confirmDelivery(buyerId);
    await this.orderRepository.save(order);

    for (const item of order.items) {
      const offer = await this.offerRepository.findById(item.offerId);
      if (offer && offer.availableBoxes === 0) {
        const harvestLot = await this.harvestLotRepository.findById(item.harvestLotId);
        if (harvestLot && harvestLot.status === 'LISTED') {
          harvestLot.markSold();
          await this.harvestLotRepository.save(harvestLot);
        }
      }
    }
    return this.orderPresenter.present(order);
  }
}
