import { BusinessRuleViolationError } from '../../../shared/errors/domain-error';
import { HarvestLot } from '../../harvest-lots/entities/harvest-lot.entity';
import { HarvestLotRepository } from '../../harvest-lots/repositories/harvest-lot.repository';
import { LotDestinationPolicy } from '../../harvest-lots/services/lot-destination-policy';
import { PublishOfferUseCase } from '../../marketplace/use-cases/publish-offer.use-case';
import { OfferDonationUseCase } from '../../surplus/use-cases/offer-donation.use-case';
import { ConfirmLotDestinationUseCase } from './confirm-lot-destination.use-case';

class InMemoryHarvestLotRepository implements HarvestLotRepository {
  readonly savedLots = new Map<string, HarvestLot>();
  async findById(harvestLotId: string) {
    return this.savedLots.get(harvestLotId) ?? null;
  }
  async findByProducer() {
    return [...this.savedLots.values()];
  }
  async save(harvestLot: HarvestLot) {
    this.savedLots.set(harvestLot.id, harvestLot);
  }
  async calculateTotals() {
    return { lotsClassified: 0, kilogramsClassified: 0 };
  }
}

function createClassifiedLot(grade: 'A' | 'D'): HarvestLot {
  const harvestLot = HarvestLot.create({
    producerId: 'producer-1',
    crop: 'tomate',
    quantityBoxes: 10,
    boxWeightKg: 20,
    photoKeys: ['harvest-photos/producer-1/a.jpg'],
    harvestedAt: new Date(),
  });
  harvestLot.applyClassification(
    { grade, confidence: 0.9, defects: [], estimatedWeightKg: null, classifierName: 'test' },
    grade === 'A' ? 'MARKETPLACE' : 'DONATION',
    grade === 'A' ? 80 : null,
  );
  return harvestLot;
}

describe('ConfirmLotDestinationUseCase', () => {
  let harvestLotRepository: InMemoryHarvestLotRepository;
  let publishOffer: jest.Mock;
  let offerDonation: jest.Mock;
  let useCase: ConfirmLotDestinationUseCase;

  beforeEach(() => {
    harvestLotRepository = new InMemoryHarvestLotRepository();
    publishOffer = jest.fn().mockResolvedValue({ id: 'offer-1' });
    offerDonation = jest.fn().mockResolvedValue({ id: 'donation-1' });
    useCase = new ConfirmLotDestinationUseCase(
      harvestLotRepository,
      new LotDestinationPolicy(),
      { execute: publishOffer } as unknown as PublishOfferUseCase,
      { execute: offerDonation } as unknown as OfferDonationUseCase,
    );
  });

  it('lote A confirmado para venda vira oferta com o preço sugerido', async () => {
    const harvestLot = createClassifiedLot('A');
    await harvestLotRepository.save(harvestLot);

    const result = await useCase.execute('producer-1', harvestLot.id, { destination: 'MARKETPLACE' });

    expect(result.offerId).toBe('offer-1');
    expect(publishOffer).toHaveBeenCalledWith(expect.objectContaining({ pricePerBox: 80, boxes: 10, grade: 'A' }));
    expect(harvestLotRepository.savedLots.get(harvestLot.id)!.status).toBe('LISTED');
  });

  it('lote D confirmado para doação avisa as ONGs com o peso total', async () => {
    const harvestLot = createClassifiedLot('D');
    await harvestLotRepository.save(harvestLot);

    const result = await useCase.execute('producer-1', harvestLot.id, { destination: 'DONATION' });

    expect(result.donationId).toBe('donation-1');
    expect(offerDonation).toHaveBeenCalledWith(expect.objectContaining({ estimatedWeightKg: 200 }));
  });

  it('bloqueia venda de lote D', async () => {
    const harvestLot = createClassifiedLot('D');
    await harvestLotRepository.save(harvestLot);

    await expect(useCase.execute('producer-1', harvestLot.id, { destination: 'MARKETPLACE' })).rejects.toThrow(
      BusinessRuleViolationError,
    );
    expect(publishOffer).not.toHaveBeenCalled();
  });
});
