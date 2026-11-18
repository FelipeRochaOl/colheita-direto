import { useAcceptOrder, useHarvestLots, useOrders } from '@colheita/api-client';
import type { HarvestLot } from '@colheita/contracts';
import { PageSection } from '@colheita/ui-web';
import { Alert, Badge, Card, Empty, Skeleton, Tabs } from 'antd';
import { useSearchParams } from 'react-router';
import { useSession } from '../features/auth/hooks/use-session';
import { ExpenseForm } from '../features/farm-management/components/expense-form';
import { FarmSummaryPanel } from '../features/farm-management/components/farm-summary-panel';
import { HarvestLotCard } from '../features/harvest-lots/components/harvest-lot-card';
import { NewHarvestLotForm } from '../features/harvest-lots/components/new-harvest-lot-form';
import { HireServicePanel } from '../features/services/components/hire-service-panel';
import { OrderList } from '../features/orders/components/order-list';

const TAB_KEYS = ['lots', 'orders', 'services', 'finance'] as const;
type ProducerTab = (typeof TAB_KEYS)[number];

/** Lotes que esperam o produtor escolher o destino. */
const needsDecision = (harvestLot: HarvestLot) =>
  harvestLot.status === 'CLASSIFIED' || harvestLot.status === 'NEEDS_REVIEW';

function TabLabel({ label, pending }: { label: string; pending: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      {label}
      {pending > 0 && <Badge count={pending} aria-label={`${pending} pendentes`} />}
    </span>
  );
}

function HarvestLotsTab() {
  const { data: harvestLots, isLoading, refetch } = useHarvestLots();
  // Pendências primeiro, para o produtor ver logo o que precisa decidir
  const sortedLots = [...(harvestLots ?? [])].sort(
    (first, second) => Number(needsDecision(second)) - Number(needsDecision(first)),
  );
  const pendingCount = sortedLots.filter(needsDecision).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <Card title="1. Fotografe a nova colheita" className="lg:col-span-2 h-fit">
        <p className="-mt-1 mb-4 text-sm text-border-active">
          A classificação sai em segundos. Depois é só escolher o destino ao lado.
        </p>
        <NewHarvestLotForm onCreated={() => void refetch()} />
      </Card>
      <section aria-labelledby="my-lots-title" className="lg:col-span-3 flex flex-col gap-4">
        <h2 id="my-lots-title" className="m-0 text-lg font-semibold">
          2. Minhas colheitas
        </h2>
        {pendingCount > 0 && (
          <Alert
            type="warning"
            showIcon
            message={
              pendingCount === 1
                ? '1 colheita espera você escolher o destino.'
                : `${pendingCount} colheitas esperam você escolher o destino.`
            }
          />
        )}
        {isLoading && <Skeleton active />}
        {harvestLots && !harvestLots.length && (
          <Empty description="Fotografe sua primeira colheita" />
        )}
        {sortedLots.map((harvestLot) => (
          <HarvestLotCard key={harvestLot.id} harvestLot={harvestLot} />
        ))}
      </section>
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

function FarmManagementTab() {
  return (
    <div className="flex flex-col gap-6">
      <FarmSummaryPanel />
      <Card title="Anotar despesa">
        <ExpenseForm />
      </Card>
    </div>
  );
}

export function ProducerPage() {
  const { session } = useSession();
  const { data: harvestLots } = useHarvestLots();
  const { data: orders } = useOrders();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get('aba') as ProducerTab | null;
  const activeTab: ProducerTab =
    requestedTab && TAB_KEYS.includes(requestedTab) ? requestedTab : 'lots';

  const lotsAwaitingDecision = (harvestLots ?? []).filter(needsDecision).length;
  const ordersAwaitingAcceptance = (orders ?? []).filter(
    (order) => order.producerId === session?.user.id && order.status === 'PAID',
  ).length;

  return (
    <PageSection title="Minha produção">
      <Tabs
        size="large"
        activeKey={activeTab}
        onChange={(tab) => setSearchParams({ aba: tab }, { replace: true })}
        items={[
          {
            key: 'lots',
            label: <TabLabel label="Colheitas" pending={lotsAwaitingDecision} />,
            children: <HarvestLotsTab />,
          },
          {
            key: 'orders',
            label: <TabLabel label="Pedidos" pending={ordersAwaitingAcceptance} />,
            children: <ProducerOrdersTab />,
          },
          { key: 'services', label: 'Frete e serviços', children: <HireServicePanel /> },
          { key: 'finance', label: 'Finanças', children: <FarmManagementTab /> },
        ]}
      />
    </PageSection>
  );
}
