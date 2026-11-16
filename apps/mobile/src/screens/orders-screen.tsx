import { useAcceptOrder, useOrders } from '@colheita/api-client';
import { ActivityIndicator, Text } from 'react-native';
import { Card } from '../components/card';
import { PrimaryButton } from '../components/primary-button';
import { ScreenContainer } from '../components/screen-container';
import { useSession } from '../features/auth/session-context';
import { capitalize, formatMoney } from '../utils/format';

const STATUS_LABELS: Record<string, string> = {
  CREATED: 'Aguardando Pix',
  PAID: 'Pago: aceite o pedido',
  ACCEPTED: 'Aceito',
  IN_TRANSIT: 'A caminho',
  DELIVERED: 'Entregue',
  SETTLED: 'Finalizado',
  CANCELLED: 'Cancelado',
  DISPUTED: 'Em análise',
};

export function OrdersScreen() {
  const { session } = useSession();
  const { data: orders, isLoading } = useOrders();
  const acceptOrder = useAcceptOrder();
  const producerOrders = (orders ?? []).filter((order) => order.producerId === session?.user.id);

  return (
    <ScreenContainer title="Pedidos">
      {isLoading && <ActivityIndicator />}
      {!isLoading && !producerOrders.length && <Text className="text-border-active">Nenhum pedido ainda.</Text>}
      {producerOrders.map((order) => (
        <Card key={order.id}>
          <Text className="font-semibold text-evergreen">{STATUS_LABELS[order.status]}</Text>
          {order.items.map((item) => (
            <Text key={item.offerId} className="text-base text-evergreen">
              {item.boxes} cx de {capitalize(item.crop)}
            </Text>
          ))}
          <Text className="text-base text-evergreen">Você recebe: {formatMoney(order.productsTotal - order.platformFee)}</Text>
          {order.status === 'PAID' && (
            <PrimaryButton
              title="Aceitar pedido"
              loading={acceptOrder.isPending && acceptOrder.variables === order.id}
              onPress={() => acceptOrder.mutate(order.id)}
            />
          )}
        </Card>
      ))}
    </ScreenContainer>
  );
}
