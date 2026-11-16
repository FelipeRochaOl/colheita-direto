import type { Order } from '@colheita/contracts';
import { MoneyText } from '@colheita/ui-web';
import { Button, Card, Empty, Tag } from 'antd';
import { capitalize, orderStatusLabels } from '../../../utils/labels';
import { PixPaymentPanel } from './pix-payment-panel';

interface OrderListProps {
  orders: Order[];
  perspective: 'buyer' | 'producer';
  onAccept?: (orderId: string) => void;
  onConfirmDelivery?: (orderId: string) => void;
  pendingOrderId?: string | null;
}

export function OrderList({
  orders,
  perspective,
  onAccept,
  onConfirmDelivery,
  pendingOrderId,
}: OrderListProps) {
  if (!orders.length) return <Empty description="Nenhum pedido ainda" />;
  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <Card
          key={order.id}
          title={<span>Pedido de {new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>}
          extra={
            <Tag color={order.status === 'CREATED' ? 'orange' : 'green'}>
              {orderStatusLabels[order.status]}
            </Tag>
          }
        >
          <ul className="mb-4">
            {order.items.map((item) => (
              <li key={item.offerId}>
                {item.boxes} cx de {capitalize(item.crop)} × <MoneyText value={item.pricePerBox} />
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm mb-4">
            <span>
              Produtos: <MoneyText value={order.productsTotal} />
            </span>
            <span>
              Serviços (frete etc.): <MoneyText value={order.servicesTotal} />
            </span>
            {perspective === 'producer' && (
              <span>
                Você recebe: <MoneyText value={order.productsTotal - order.platformFee} strong />
              </span>
            )}
            <span>
              Total: <MoneyText value={order.total} strong />
            </span>
          </div>
          {perspective === 'buyer' && order.status === 'CREATED' && (
            <PixPaymentPanel order={order} />
          )}
          {perspective === 'producer' && order.status === 'PAID' && (
            <Button
              type="primary"
              loading={pendingOrderId === order.id}
              onClick={() => onAccept?.(order.id)}
            >
              Aceitar pedido
            </Button>
          )}
          {perspective === 'buyer' && ['ACCEPTED', 'IN_TRANSIT'].includes(order.status) && (
            <Button
              type="primary"
              loading={pendingOrderId === order.id}
              onClick={() => onConfirmDelivery?.(order.id)}
            >
              Confirmar recebimento
            </Button>
          )}
        </Card>
      ))}
    </div>
  );
}
