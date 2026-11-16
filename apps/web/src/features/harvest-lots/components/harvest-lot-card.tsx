import type { HarvestLot } from '@colheita/contracts';
import { MoneyText, QualityGradeBadge, describeQualityGrade } from '@colheita/ui-web';
import { Card, Spin, Tag } from 'antd';
import { capitalize, harvestLotStatusLabels, lotDestinationLabels } from '../../../utils/labels';
import { DestinationChooser } from './destination-chooser';

export function HarvestLotCard({ harvestLot }: { harvestLot: HarvestLot }) {
  const isAwaitingDecision = harvestLot.status === 'CLASSIFIED' || harvestLot.status === 'NEEDS_REVIEW';
  return (
    <Card>
      <div className="flex gap-4">
        <img src={harvestLot.photoUrls[0]} alt={`Foto do lote de ${harvestLot.crop}`} className="w-28 h-28 object-cover rounded-sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-lg font-semibold">
              {harvestLot.quantityBoxes} cx de {capitalize(harvestLot.crop)}
            </span>
            {harvestLot.classification ? (
              <QualityGradeBadge grade={harvestLot.classification.grade} size="large" />
            ) : (
              <Spin />
            )}
          </div>
          <Tag className="mt-1!" color={harvestLot.status === 'NEEDS_REVIEW' ? 'orange' : 'green'}>
            {harvestLotStatusLabels[harvestLot.status]}
          </Tag>
          {harvestLot.classification && (
            <div className="text-sm mt-2">
              {describeQualityGrade(harvestLot.classification.grade)} · confiança{' '}
              {Math.round(harvestLot.classification.confidence * 100)}%
              {harvestLot.classification.defects.length > 0 && <> · {harvestLot.classification.defects.join(', ')}</>}
            </div>
          )}
          {harvestLot.suggestedPricePerBox && (
            <div className="text-sm">
              Preço sugerido: <MoneyText value={harvestLot.suggestedPricePerBox} strong /> / caixa
            </div>
          )}
          {!isAwaitingDecision && harvestLot.destination && (
            <div className="text-sm">Destino: {lotDestinationLabels[harvestLot.destination]}</div>
          )}
        </div>
      </div>
      {isAwaitingDecision && (
        <div className="mt-4 pt-4 border-t border-surface">
          <DestinationChooser harvestLot={harvestLot} />
        </div>
      )}
    </Card>
  );
}
