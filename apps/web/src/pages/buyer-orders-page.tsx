import { useConfirmOrderDelivery, useOrders } from '@colheita/api-client';
import { PageSection } from '@colheita/ui-web';
import { Skeleton } from 'antd';
import { useSession } from '../features/auth/hooks/use-session';
import { OrderList } from '../features/orders/components/order-list';

export function BuyerOrdersPage() {
  const { session } = useSession();
  const { data: orders, isLoading } = useOrders();
  const confirmOrderDelivery = useConfirmOrderDelivery();

  return (
    <PageSection title="Meus pedidos">
      {isLoading ? (
        <Skeleton active />
      ) : (
        <OrderList
          perspective="buyer"
          orders={(orders ?? []).filter((order) => order.buyerId === session?.user.id)}
          onConfirmDelivery={(orderId) => confirmOrderDelivery.mutate(orderId)}
          pendingOrderId={confirmOrderDelivery.isPending ? confirmOrderDelivery.variables : null}
        />
      )}
    </PageSection>
  );
}
