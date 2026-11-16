import { useConfirmLotDestination } from '@colheita/api-client';
import type { HarvestLot, LotDestination, QualityGrade } from '@colheita/contracts';
import { Alert, Button, InputNumber, Radio } from 'antd';
import { useState } from 'react';
import { lotDestinationLabels } from '../../../utils/labels';

/** Espelha LotDestinationPolicy.allowedDestinations no backend (o servidor valida de novo). */
const ALLOWED_DESTINATIONS: Record<QualityGrade, LotDestination[]> = {
  A: ['MARKETPLACE', 'DISCOUNT_MARKETPLACE', 'INDUSTRY', 'DONATION'],
  B: ['DISCOUNT_MARKETPLACE', 'MARKETPLACE', 'INDUSTRY', 'DONATION'],
  C: ['INDUSTRY', 'DONATION', 'ANIMAL_FEED', 'COMPOST'],
  D: ['DONATION', 'ANIMAL_FEED', 'COMPOST'],
};
const SALE_DESTINATIONS: LotDestination[] = ['MARKETPLACE', 'DISCOUNT_MARKETPLACE', 'INDUSTRY'];

export function DestinationChooser({ harvestLot }: { harvestLot: HarvestLot }) {
  const grade = harvestLot.classification!.grade;
  const [destination, setDestination] = useState<LotDestination>(
    harvestLot.destination ?? ALLOWED_DESTINATIONS[grade][0],
  );
  const [pricePerBox, setPricePerBox] = useState<number | null>(harvestLot.suggestedPricePerBox);
  const confirmLotDestination = useConfirmLotDestination();
  const isSale = SALE_DESTINATIONS.includes(destination);

  return (
    <div className="flex flex-col gap-3">
      <Radio.Group
        value={destination}
        onChange={(event) => setDestination(event.target.value)}
        className="flex! flex-col! gap-1"
      >
        {ALLOWED_DESTINATIONS[grade].map((option) => (
          <Radio key={option} value={option}>
            {lotDestinationLabels[option]}
            {option === harvestLot.destination && (
              <span className="text-green-dark text-sm"> · sugerido</span>
            )}
          </Radio>
        ))}
      </Radio.Group>
      {isSale && (
        <InputNumber
          prefix="R$"
          addonAfter="por caixa"
          min={1}
          value={pricePerBox}
          onChange={setPricePerBox}
          className="max-w-60"
        />
      )}
      {confirmLotDestination.error && (
        <Alert type="error" showIcon message={confirmLotDestination.error.message} />
      )}
      <Button
        type="primary"
        loading={confirmLotDestination.isPending}
        disabled={isSale && !pricePerBox}
        onClick={() =>
          confirmLotDestination.mutate({
            harvestLotId: harvestLot.id,
            destination,
            pricePerBox: isSale && pricePerBox ? pricePerBox : undefined,
          })
        }
      >
        Confirmar destino
      </Button>
    </div>
  );
}
