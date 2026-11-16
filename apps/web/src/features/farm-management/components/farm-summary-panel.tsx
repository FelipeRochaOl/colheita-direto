import { useFarmSummary } from '@colheita/api-client';
import { formatMoney } from '@colheita/ui-web';
import { Card, Skeleton, Statistic, Table } from 'antd';
import { capitalize } from '../../../utils/labels';

export function FarmSummaryPanel() {
  const { data: summary, isLoading } = useFarmSummary();
  if (isLoading || !summary) return <Skeleton active />;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><Statistic title={`Receitas (${summary.periodDays} dias)`} value={formatMoney(summary.revenue)} /></Card>
        <Card><Statistic title="Despesas" value={formatMoney(summary.expenses)} /></Card>
        <Card>
          <Statistic
            title="Lucro"
            value={formatMoney(summary.profit)}
            valueStyle={{ color: summary.profit >= 0 ? 'var(--color-green-dark)' : 'var(--color-danger)' }}
          />
        </Card>
      </div>
      <Card title="Estoque">
        <Table
          size="small"
          pagination={false}
          rowKey="crop"
          dataSource={summary.stock}
          locale={{ emptyText: 'Sem estoque no momento' }}
          columns={[
            { title: 'Produto', dataIndex: 'crop', render: (crop: string) => capitalize(crop) },
            { title: 'Caixas disponíveis', dataIndex: 'boxesAvailable' },
            { title: 'Aguardando classificação', dataIndex: 'boxesAwaitingClassification' },
          ]}
        />
      </Card>
    </div>
  );
}
