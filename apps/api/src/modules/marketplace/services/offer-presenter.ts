import { Inject, Injectable } from '@nestjs/common';
import type { GeoPoint, Offer as OfferView } from '@colheita/contracts';
import { calculateDistanceKm } from '../../../shared/geo/geo-distance';
import { PHOTO_STORAGE, PhotoStorage } from '../../../shared/storage/photo-storage';
import { PRODUCER_REPOSITORY, ProducerRepository } from '../../producers/repositories/producer.repository';
import { Offer } from '../entities/offer.entity';

@Injectable()
export class OfferPresenter {
  constructor(
    @Inject(PHOTO_STORAGE) private readonly photoStorage: PhotoStorage,
    @Inject(PRODUCER_REPOSITORY) private readonly producerRepository: ProducerRepository,
  ) {}

  async present(offer: Offer, buyerLocation?: GeoPoint): Promise<OfferView> {
    const [view] = await this.presentMany([offer], buyerLocation);
    return view!;
  }

  /**
   * O nome do produtor vem do perfil atual (uma consulta para a lista toda), assim a edição de
   * "Meus dados" aparece em todas as ofertas. O nome gravado na publicação fica só como reserva.
   */
  async presentMany(offers: Offer[], buyerLocation?: GeoPoint): Promise<OfferView[]> {
    const producerIds = [...new Set(offers.map((offer) => offer.toSnapshot().producerId))];
    const producers = producerIds.length ? await this.producerRepository.findManyByIds(producerIds) : [];
    const currentNameByProducer = new Map(producers.map((producer) => [producer.id, producer.name]));
    return Promise.all(
      offers.map((offer) => this.toView(offer, currentNameByProducer.get(offer.toSnapshot().producerId), buyerLocation)),
    );
  }

  private async toView(offer: Offer, currentProducerName: string | undefined, buyerLocation?: GeoPoint): Promise<OfferView> {
    const snapshot = offer.toSnapshot();
    return {
      id: snapshot.id,
      harvestLotId: snapshot.harvestLotId,
      producerId: snapshot.producerId,
      producerName: currentProducerName ?? snapshot.producerName,
      crop: snapshot.crop,
      grade: snapshot.grade,
      availableBoxes: snapshot.availableBoxes,
      boxWeightKg: snapshot.boxWeightKg,
      pricePerBox: snapshot.pricePerBox,
      photoUrls: await Promise.all(snapshot.photoKeys.map((photoKey) => this.photoStorage.createReadUrl(photoKey))),
      location: snapshot.location,
      city: snapshot.city,
      state: snapshot.state,
      distanceKm: buyerLocation ? Math.round(calculateDistanceKm(buyerLocation, snapshot.location) * 10) / 10 : null,
    };
  }
}
