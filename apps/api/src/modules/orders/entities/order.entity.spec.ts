import { BusinessRuleViolationError } from '../../../shared/errors/domain-error';
import { Order } from './order.entity';

function placeOrder(): Order {
  return Order.place({
    buyerId: 'buyer-1',
    producerId: 'producer-1',
    items: [{ offerId: 'offer-1', harvestLotId: 'lot-1', crop: 'tomate', boxes: 10, boxWeightKg: 20, pricePerBox: 75.5 }],
    deliveryMode: 'PLATFORM_FREIGHT',
    serviceCharges: [
      { serviceType: 'TRANSPORT', serviceProviderId: 'carrier-1', serviceProviderWalletId: 'wallet-c', amount: 61 },
    ],
    platformFeePercent: 8,
  });
}

describe('Order', () => {
  it('calcula totais, taxa da plataforma e repasse ao produtor', () => {
    const order = placeOrder();
    const snapshot = order.toSnapshot();
    expect(snapshot.productsTotal).toBe(755);
    expect(snapshot.servicesTotal).toBe(61);
    expect(snapshot.platformFee).toBe(60.4);
    expect(order.total).toBe(816);
    expect(order.producerPayout).toBe(694.6);
    expect(order.totalWeightKg).toBe(200);
  });

  it('o split fecha: produtor + prestadores + plataforma = total pago', () => {
    const order = placeOrder();
    const servicesTotal = order.serviceCharges.reduce((sum, charge) => sum + charge.amount, 0);
    expect(order.producerPayout + servicesTotal + order.platformFee).toBeCloseTo(order.total, 2);
  });

  it('segue o ciclo pago → aceito → entregue', () => {
    const order = placeOrder();
    order.markPaid();
    order.acceptByProducer('producer-1');
    order.confirmDelivery('buyer-1');
    expect(order.status).toBe('DELIVERED');
  });

  it('não deixa aceitar pedido não pago nem pedido de outro produtor', () => {
    const order = placeOrder();
    expect(() => order.acceptByProducer('producer-1')).toThrow(BusinessRuleViolationError);
    order.markPaid();
    expect(() => order.acceptByProducer('outro-produtor')).toThrow(BusinessRuleViolationError);
  });
});
