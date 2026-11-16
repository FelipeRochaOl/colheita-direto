import type { OrderStatus, ServiceType } from '@colheita/contracts';
import { generateEntityId } from '../../../shared/database/entity-id';
import { BusinessRuleViolationError } from '../../../shared/errors/domain-error';

export type DeliveryMode = 'PICKUP' | 'PRODUCER_DELIVERY' | 'PLATFORM_FREIGHT';

export interface OrderItem {
  offerId: string;
  harvestLotId: string;
  crop: string;
  boxes: number;
  boxWeightKg: number;
  pricePerBox: number;
}

export interface ServiceCharge {
  serviceType: ServiceType;
  serviceProviderId: string;
  serviceProviderWalletId: string | null;
  amount: number;
}

export interface OrderPayment {
  chargeId: string;
  pixQrCodeImage: string | null;
  pixCopyPaste: string | null;
  invoiceUrl: string | null;
}

export interface OrderProps {
  id: string;
  buyerId: string;
  producerId: string;
  items: OrderItem[];
  deliveryMode: DeliveryMode;
  serviceCharges: ServiceCharge[];
  productsTotal: number;
  servicesTotal: number;
  platformFee: number;
  total: number;
  status: OrderStatus;
  payment: OrderPayment | null;
  paidAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
}

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  CREATED: ['PAID', 'CANCELLED'],
  PAID: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['IN_TRANSIT', 'DELIVERED', 'CANCELLED'],
  IN_TRANSIT: ['DELIVERED', 'DISPUTED'],
  DELIVERED: ['SETTLED', 'DISPUTED'],
  SETTLED: [],
  CANCELLED: [],
  DISPUTED: ['SETTLED', 'CANCELLED'],
};

/** Pedido de um comprador para um produtor, com serviços intermediários e taxa da plataforma. */
export class Order {
  private constructor(private readonly props: OrderProps) {}

  static place(input: {
    buyerId: string;
    producerId: string;
    items: OrderItem[];
    deliveryMode: DeliveryMode;
    serviceCharges: ServiceCharge[];
    platformFeePercent: number;
  }): Order {
    const productsTotal = Order.roundToCents(
      input.items.reduce((sum, item) => sum + item.boxes * item.pricePerBox, 0),
    );
    const servicesTotal = Order.roundToCents(input.serviceCharges.reduce((sum, charge) => sum + charge.amount, 0));
    const platformFee = Order.roundToCents((productsTotal * input.platformFeePercent) / 100);
    return new Order({
      id: generateEntityId(),
      buyerId: input.buyerId,
      producerId: input.producerId,
      items: input.items,
      deliveryMode: input.deliveryMode,
      serviceCharges: input.serviceCharges,
      productsTotal,
      servicesTotal,
      platformFee,
      total: Order.roundToCents(productsTotal + servicesTotal),
      status: 'CREATED',
      payment: null,
      paidAt: null,
      deliveredAt: null,
      createdAt: new Date(),
    });
  }

  static restore(props: OrderProps): Order {
    return new Order(props);
  }

  get id() {
    return this.props.id;
  }
  get buyerId() {
    return this.props.buyerId;
  }
  get producerId() {
    return this.props.producerId;
  }
  get items() {
    return [...this.props.items];
  }
  get serviceCharges() {
    return [...this.props.serviceCharges];
  }
  get status() {
    return this.props.status;
  }
  get total() {
    return this.props.total;
  }
  get platformFee() {
    return this.props.platformFee;
  }
  get payment() {
    return this.props.payment;
  }

  /** O comprador paga o total; o produtor recebe os produtos menos a taxa; cada prestador recebe seu serviço. */
  get producerPayout(): number {
    return Order.roundToCents(this.props.productsTotal - this.props.platformFee);
  }

  get totalWeightKg(): number {
    return this.props.items.reduce((sum, item) => sum + item.boxes * item.boxWeightKg, 0);
  }

  attachPayment(payment: OrderPayment): void {
    this.props.payment = payment;
  }

  markPaid(): void {
    this.transitionTo('PAID');
    this.props.paidAt = new Date();
  }

  acceptByProducer(producerId: string): void {
    if (producerId !== this.props.producerId) throw new BusinessRuleViolationError('Pedido de outro produtor');
    this.transitionTo('ACCEPTED');
  }

  confirmDelivery(buyerId: string): void {
    if (buyerId !== this.props.buyerId) throw new BusinessRuleViolationError('Pedido de outro comprador');
    this.transitionTo('DELIVERED');
    this.props.deliveredAt = new Date();
  }

  cancel(): void {
    this.transitionTo('CANCELLED');
  }

  isPaid(): boolean {
    return this.props.paidAt !== null;
  }

  toSnapshot(): OrderProps {
    return { ...this.props, items: [...this.props.items], serviceCharges: [...this.props.serviceCharges] };
  }

  private transitionTo(nextStatus: OrderStatus): void {
    if (!ALLOWED_TRANSITIONS[this.props.status].includes(nextStatus)) {
      throw new BusinessRuleViolationError(`Pedido ${this.props.status} não pode ir para ${nextStatus}`);
    }
    this.props.status = nextStatus;
  }

  private static roundToCents(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
