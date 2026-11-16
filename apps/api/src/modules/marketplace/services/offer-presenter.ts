import { Inject, Injectable } from '@nestjs/common';
import type { GeoPoint, Offer as OfferView } from '@colheita/contracts';
import { calculateDistanceKm } from '../../../shared/geo/geo-distance';
import { PHOTO_STORAGE, PhotoStorage } from '../../../shared/storage/photo-storage';
import { Offer } from '../entities/offer.entity';

@Injectable()
export class OfferPresenter {
  constructor(@Inject(PHOTO_STORAGE) private readonly photoStorage: PhotoStorage) {}

  async present(offer: Offer, buyerLocation?: GeoPoint): Promise<OfferView> {
    const snapshot = offer.toSnapshot();
    return {
      id: snapshot.id,
      harvestLotId: snapshot.harvestLotId,
      producerId: snapshot.producerId,
      producerName: snapshot.producerName,
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
