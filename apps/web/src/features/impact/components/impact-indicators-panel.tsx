import { useImpactIndicators } from '@colheita/api-client';
import { formatMoney, StatCard } from '@colheita/ui-web';
import { Skeleton } from 'antd';

const numberFormatter = new Intl.NumberFormat('pt-BR');

/** KPIs do piloto (concepcao.md §5.1), calculados em tempo real pela API. */
export function ImpactIndicatorsPanel() {
  const { data: indicators, isLoading } = useImpactIndicators();
  if (isLoading || !indicators) return <Skeleton active />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <StatCard label="Renda direta aos produtores" value={formatMoney(indicators.revenueToProducers)} hint="Sem atravessador" />
      <StatCard label="Alimento vendido" value={`${numberFormatter.format(indicators.kilogramsSold)} kg`} />
      <StatCard label="Alimento doado" value={`${numberFormatter.format(indicators.kilogramsDonated)} kg`} hint="Recebido por ONGs" />
      <StatCard
        label="Aproveitamento da colheita"
        value={`${Math.round(indicators.utilizationRate * 100)}%`}
        hint={`${indicators.lotsClassified} lotes classificados por foto`}
      />
    </div>
  );
}
