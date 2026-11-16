import { BusinessRuleViolationError } from '../../../shared/errors/domain-error';
import { HarvestLot } from './harvest-lot.entity';

function createPendingLot(): HarvestLot {
  return HarvestLot.create({
    producerId: 'producer-1',
    crop: ' Tomate ',
    quantityBoxes: 40,
    boxWeightKg: 20,
    photoKeys: ['harvest-photos/producer-1/a.jpg'],
    harvestedAt: new Date('2026-11-16'),
  });
}

describe('HarvestLot', () => {
  it('normaliza a cultura e calcula o peso total', () => {
    const harvestLot = createPendingLot();
    expect(harvestLot.crop).toBe('tomate');
    expect(harvestLot.totalWeightKg).toBe(800);
    expect(harvestLot.status).toBe('PENDING_CLASSIFICATION');
  });

  it('fica CLASSIFIED quando a confiança é alta', () => {
    const harvestLot = createPendingLot();
    harvestLot.applyClassification(
      { grade: 'A', confidence: 0.92, defects: [], estimatedWeightKg: null, classifierName: 'test' },
      'MARKETPLACE',
      80,
    );
    expect(harvestLot.status).toBe('CLASSIFIED');
    expect(harvestLot.suggestedPricePerBox).toBe(80);
  });

  it('pede revisão humana quando a confiança é baixa', () => {
    const harvestLot = createPendingLot();
    harvestLot.applyClassification(
      { grade: 'B', confidence: 0.5, defects: ['manchas'], estimatedWeightKg: null, classifierName: 'test' },
      'DISCOUNT_MARKETPLACE',
      null,
    );
    expect(harvestLot.status).toBe('NEEDS_REVIEW');
  });

  it('não aceita destino antes da classificação', () => {
    expect(() => createPendingLot().confirmDestination('MARKETPLACE')).toThrow(BusinessRuleViolationError);
  });

  it.each([
    ['MARKETPLACE', 'LISTED'],
    ['INDUSTRY', 'LISTED'],
    ['DONATION', 'DONATION_OFFERED'],
    ['COMPOST', 'DISCARDED'],
  ] as const)('destino %s leva ao status %s', (destination, expectedStatus) => {
    const harvestLot = createPendingLot();
    harvestLot.applyClassification(
      { grade: 'C', confidence: 0.9, defects: [], estimatedWeightKg: null, classifierName: 'test' },
      'INDUSTRY',
      null,
    );
    harvestLot.confirmDestination(destination);
    expect(harvestLot.status).toBe(expectedStatus);
  });
});
