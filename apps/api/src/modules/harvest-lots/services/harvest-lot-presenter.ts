import { Inject, Injectable } from '@nestjs/common';
import type { HarvestLot as HarvestLotView } from '@colheita/contracts';
import { PHOTO_STORAGE, PhotoStorage } from '../../../shared/storage/photo-storage';
import { HarvestLot } from '../entities/harvest-lot.entity';

/** Converte a entidade no formato da API, com URLs temporárias para as fotos. */
@Injectable()
export class HarvestLotPresenter {
  constructor(@Inject(PHOTO_STORAGE) private readonly photoStorage: PhotoStorage) {}

  async present(harvestLot: HarvestLot): Promise<HarvestLotView> {
    const snapshot = harvestLot.toSnapshot();
    return {
      id: snapshot.id,
      producerId: snapshot.producerId,
      crop: snapshot.crop,
      quantityBoxes: snapshot.quantityBoxes,
      boxWeightKg: snapshot.boxWeightKg,
      photoUrls: await Promise.all(snapshot.photoKeys.map((photoKey) => this.photoStorage.createReadUrl(photoKey))),
      status: snapshot.status,
      classification: snapshot.classification,
      destination: snapshot.destination ?? snapshot.recommendedDestination,
      suggestedPricePerBox: snapshot.suggestedPricePerBox,
      harvestedAt: snapshot.harvestedAt.toISOString(),
      createdAt: snapshot.createdAt.toISOString(),
    };
  }
}
