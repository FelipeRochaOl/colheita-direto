import { PageSection } from '@colheita/ui-web';
import { ImpactIndicatorsPanel } from '../features/impact/components/impact-indicators-panel';

export function ImpactPage() {
  return (
    <div className="bg-evergreen min-h-[60vh]">
      <PageSection>
        <h1 className="text-white text-3xl font-semibold mb-2">Relatório de impacto</h1>
        <p className="text-muted mb-8">
          Indicadores agregados e anônimos, atualizados em tempo real. ODS 2, 10, 12 e 13.
        </p>
        <ImpactIndicatorsPanel />
      </PageSection>
    </div>
  );
}
