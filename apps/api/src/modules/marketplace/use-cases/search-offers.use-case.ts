import { Inject, Injectable } from '@nestjs/common';
import type { Offer as OfferView, SearchOffersInput } from '@colheita/contracts';
import { OFFER_REPOSITORY, OfferRepository } from '../repositories/offer.repository';
import { OfferPresenter } from '../services/offer-presenter';

const DEFAULT_MAX_DISTANCE_KM = 150;

@Injectable()
export class SearchOffersUseCase {
  constructor(
    @Inject(OFFER_REPOSITORY) private readonly offerRepository: OfferRepository,
    private readonly offerPresenter: OfferPresenter,
  ) {}

  async execute(input: SearchOffersInput): Promise<OfferView[]> {
    const buyerLocation =
      input.latitude !== undefined && input.longitude !== undefined
        ? { latitude: input.latitude, longitude: input.longitude }
        : undefined;
    const offers = await this.offerRepository.search({
      crop: input.crop,
      grades: input.grades,
      maxPricePerBox: input.maxPricePerBox,
      near: buyerLocation
        ? { location: buyerLocation, maxDistanceKm: input.maxDistanceKm ?? DEFAULT_MAX_DISTANCE_KM }
        : undefined,
    });
    return this.offerPresenter.presentMany(offers, buyerLocation);
  }
}
