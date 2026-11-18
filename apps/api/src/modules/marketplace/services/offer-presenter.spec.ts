import { Producer } from '../../producers/entities/producer.entity';
import { ProducerRepository } from '../../producers/repositories/producer.repository';
import { PhotoStorage } from '../../../shared/storage/photo-storage';
import { Offer } from '../entities/offer.entity';
import { OfferPresenter } from './offer-presenter';

const photoStorage = { createReadUrl: async (key: string) => `https://fotos/${key}` } as unknown as PhotoStorage;

function publishOffer(producerId: string, producerName: string): Offer {
  return Offer.publish({
    harvestLotId: 'lot-1',
    producerId,
    producerName,
    crop: 'tomate',
    grade: 'A',
    channel: 'MARKETPLACE',
    availableBoxes: 10,
    boxWeightKg: 20,
    pricePerBox: 80,
    photoKeys: ['a.jpg'],
    location: { latitude: -23.5, longitude: -46.2 },
    city: 'Mogi',
    state: 'SP',
  });
}

function producerRepositoryWith(producers: Producer[]) {
  const findManyByIds = jest.fn(async (ids: string[]) => producers.filter((producer) => ids.includes(producer.id)));
  return { repository: { findManyByIds } as unknown as ProducerRepository, findManyByIds };
}

const renamedProducer = Producer.register({
  id: 'producer-1',
  name: 'João Silva Neto',
  farmName: 'Sítio',
  farmLocation: { latitude: -23.5, longitude: -46.2 },
  city: 'Mogi',
  state: 'SP',
  crops: ['tomate'],
  familyFarmRegistration: null,
});

describe('OfferPresenter', () => {
  it('mostra o nome atual do produtor, não o gravado na publicação', async () => {
    const { repository, findManyByIds } = producerRepositoryWith([renamedProducer]);
    const presenter = new OfferPresenter(photoStorage, repository);

    const views = await presenter.presentMany([publishOffer('producer-1', 'João'), publishOffer('producer-1', 'João')]);

    expect(views.map((view) => view.producerName)).toEqual(['João Silva Neto', 'João Silva Neto']);
    expect(findManyByIds).toHaveBeenCalledTimes(1);
    expect(findManyByIds).toHaveBeenCalledWith(['producer-1']);
  });

  it('usa o nome gravado quando o perfil não é encontrado', async () => {
    const presenter = new OfferPresenter(photoStorage, producerRepositoryWith([]).repository);
    expect((await presenter.present(publishOffer('sumiu', 'Maria'))).producerName).toBe('Maria');
  });
});
