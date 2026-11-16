import { useAcceptOrder, useHarvestLots, useOrders } from '@colheita/api-client';
import { PageSection } from '@colheita/ui-web';
import { Card, Empty, Skeleton, Tabs } from 'antd';
import { useSession } from '../features/auth/hooks/use-session';
import { ExpenseForm } from '../features/farm-management/components/expense-form';
import { FarmSummaryPanel } from '../features/farm-management/components/farm-summary-panel';
import { HarvestLotCard } from '../features/harvest-lots/components/harvest-lot-card';
import { NewHarvestLotForm } from '../features/harvest-lots/components/new-harvest-lot-form';
import { OrderList } from '../features/orders/components/order-list';

function HarvestLotsTab() {
  const { data: harvestLots, isLoading, refetch } = useHarvestLots();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <Card title="Nova colheita" className="lg:col-span-2 h-fit">
        <NewHarvestLotForm onCreated={() => void refetch()} />
      </Card>
      <div className="lg:col-span-3 flex flex-col gap-4">
        {isLoading && <Skeleton active />}
        {harvestLots && !harvestLots.length && <Empty description="Fotografe sua primeira colheita" />}
        {harvestLots?.map((harvestLot) => <HarvestLotCard key={harvestLot.id} harvestLot={harvestLot} />)}
      </div>
    </div>
  );
}

function ProducerOrdersTab() {
  const { session } = useSession();
  const { data: orders, isLoading } = useOrders();
  const acceptOrder = useAcceptOrder();
  if (isLoading) return <Skeleton active />;
  return (
    <OrderList
      perspective="producer"
      orders={(orders ?? []).filter((order) => order.producerId === session?.user.id)}
      onAccept={(orderId) => acceptOrder.mutate(orderId)}
      pendingOrderId={acceptOrder.isPending ? acceptOrder.variables : null}
    />
  );
}

export function ProducerPage() {
  return (
    <PageSection title="Minha produção">
      <Tabs
        items={[
          { key: 'lots', label: 'Colheitas', children: <HarvestLotsTab /> },
          { key: 'orders', label: 'Pedidos', children: <ProducerOrdersTab /> },
          {
            key: 'finance',
            label: 'Gestão',
            children: (
              <div className="flex flex-col gap-6">
                <Card title="Anotar despesa"><ExpenseForm /></Card>
                <FarmSummaryPanel />
              </div>
            ),
          },
        ]}
      />
    </PageSection>
  );
}
