import { Inject, Injectable, Logger } from '@nestjs/common';
import type { CreateOrderInput, Order as OrderView } from '@colheita/contracts';
import { AppConfigService } from '../../../shared/config/app-config.service';
import { BusinessRuleViolationError, EntityNotFoundError } from '../../../shared/errors/domain-error';
import { BUYER_REPOSITORY, BuyerRepository } from '../../buyers/repositories/buyer.repository';
import { Buyer } from '../../buyers/entities/buyer.entity';
import { Offer } from '../../marketplace/entities/offer.entity';
import { OFFER_REPOSITORY, OfferRepository } from '../../marketplace/repositories/offer.repository';
import { PAYMENT_GATEWAY, PaymentGateway, PaymentSplit } from '../../payments/gateways/payment-gateway';
import { PRODUCER_REPOSITORY, ProducerRepository } from '../../producers/repositories/producer.repository';
import { Order, OrderItem } from '../entities/order.entity';
import { ORDER_REPOSITORY, OrderRepository } from '../repositories/order.repository';
import { IntermediaryServicePlanner } from '../services/intermediary-service-planner';
import { OrderPresenter } from '../services/order-presenter';

/**
 * Fecha o carrinho: um pedido por produtor, caixas reservadas de forma atômica,
 * serviços intermediários planejados e cobrança Pix com split.
 */
@Injectable()
export class CreateOrderUseCase {
  private readonly logger = new Logger(CreateOrderUseCase.name);

  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orderRepository: OrderRepository,
    @Inject(OFFER_REPOSITORY) private readonly offerRepository: OfferRepository,
    @Inject(BUYER_REPOSITORY) private readonly buyerRepository: BuyerRepository,
    @Inject(PRODUCER_REPOSITORY) private readonly producerRepository: ProducerRepository,
    @Inject(PAYMENT_GATEWAY) private readonly paymentGateway: PaymentGateway,
    private readonly intermediaryServicePlanner: IntermediaryServicePlanner,
    private readonly orderPresenter: OrderPresenter,
    private readonly appConfig: AppConfigService,
  ) {}

  async execute(buyerId: string, input: CreateOrderInput): Promise<OrderView[]> {
    const buyer = await this.buyerRepository.findById(buyerId);
    if (!buyer) throw new BusinessRuleViolationError('Complete seu cadastro de comprador antes de comprar');

    const offersByProducer = await this.groupItemsByProducer(input.items);
    const createdOrders: OrderView[] = [];
    for (const [producerId, requestedItems] of offersByProducer) {
      const order = await this.placeOrderForProducer(buyer, producerId, requestedItems, input);
      createdOrders.push(this.orderPresenter.present(order));
    }
    return createdOrders;
  }

  private async groupItemsByProducer(
    items: CreateOrderInput['items'],
  ): Promise<Map<string, Array<{ offer: Offer; boxes: number }>>> {
    const groups = new Map<string, Array<{ offer: Offer; boxes: number }>>();
    for (const item of items) {
      const offer = await this.offerRepository.findById(item.offerId);
      if (!offer?.isActive) throw new EntityNotFoundError('Oferta', item.offerId);
      const group = groups.get(offer.producerId) ?? [];
      group.push({ offer, boxes: item.boxes });
      groups.set(offer.producerId, group);
    }
    return groups;
  }

  private async placeOrderForProducer(
    buyer: Buyer,
    producerId: string,
    requestedItems: Array<{ offer: Offer; boxes: number }>,
    input: CreateOrderInput,
  ): Promise<Order> {
    const reservedItems = await this.reserveBoxes(requestedItems);
    try {
      const serviceCharges = await this.intermediaryServicePlanner.planServices({
        deliveryMode: input.deliveryMode,
        extraServices: input.extraServices,
        pickupLocation: requestedItems[0].offer.location,
        deliveryLocation: buyer.deliveryLocation,
        boxes: reservedItems.reduce((sum, item) => sum + item.boxes, 0),
      });
      const order = Order.place({
        buyerId: buyer.id,
        producerId,
        items: reservedItems,
        deliveryMode: input.deliveryMode,
        serviceCharges,
        platformFeePercent: this.appConfig.get('ASAAS_PLATFORM_FEE_PERCENT'),
      });
      order.attachPayment(await this.createPixCharge(buyer, order));
      await this.orderRepository.save(order);
      return order;
    } catch (error) {
      await this.releaseBoxes(reservedItems);
      throw error;
    }
  }

  private async reserveBoxes(requestedItems: Array<{ offer: Offer; boxes: number }>): Promise<OrderItem[]> {
    const reservedItems: OrderItem[] = [];
    for (const { offer, boxes } of requestedItems) {
      const wasReserved = await this.offerRepository.tryReserveBoxes(offer.id, boxes);
      if (!wasReserved) {
        await this.releaseBoxes(reservedItems);
        throw new BusinessRuleViolationError(`Só restam ${offer.availableBoxes} caixas de ${offer.crop}`);
      }
      reservedItems.push({
        offerId: offer.id,
        harvestLotId: offer.harvestLotId,
        crop: offer.crop,
        boxes,
        boxWeightKg: offer.boxWeightKg,
        pricePerBox: offer.pricePerBox,
      });
    }
    return reservedItems;
  }

  private async releaseBoxes(items: OrderItem[]): Promise<void> {
    await Promise.all(items.map((item) => this.offerRepository.releaseBoxes(item.offerId, item.boxes)));
  }

  private async createPixCharge(buyer: Buyer, order: Order) {
    if (!buyer.paymentCustomerId) {
      buyer.linkPaymentCustomer(
        await this.paymentGateway.ensureCustomer({
          name: buyer.name,
          document: buyer.document,
          phoneNumber: buyer.phoneNumber,
        }),
      );
      await this.buyerRepository.save(buyer);
    }
    return this.paymentGateway.createPixCharge({
      customerId: buyer.paymentCustomerId!,
      amount: order.total,
      description: `Colheita Direta – pedido ${order.id}`,
      externalReference: order.id,
      splits: await this.buildSplits(order),
    });
  }

  /** Produtor e prestadores recebem direto nas próprias carteiras; o restante (taxa) fica com a plataforma. */
  private async buildSplits(order: Order): Promise<PaymentSplit[]> {
    const splits: PaymentSplit[] = [];
    const producer = await this.producerRepository.findById(order.producerId);
    if (producer?.paymentWalletId) {
      splits.push({ walletId: producer.paymentWalletId, amount: order.producerPayout });
    } else {
      this.logger.warn(`Produtor ${order.producerId} sem carteira Asaas: repasse será manual`);
    }
    for (const charge of order.serviceCharges) {
      if (charge.serviceProviderWalletId) {
        splits.push({ walletId: charge.serviceProviderWalletId, amount: charge.amount });
      }
    }
    return splits;
  }
}
