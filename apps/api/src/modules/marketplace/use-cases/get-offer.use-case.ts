import { Inject, Injectable } from '@nestjs/common';
import type { Offer as OfferView } from '@colheita/contracts';
import { EntityNotFoundError } from '../../../shared/errors/domain-error';
import { OFFER_REPOSITORY, OfferRepository } from '../repositories/offer.repository';
import { OfferPresenter } from '../services/offer-presenter';

@Injectable()
export class GetOfferUseCase {
  constructor(
    @Inject(OFFER_REPOSITORY) private readonly offerRepository: OfferRepository,
    private readonly offerPresenter: OfferPresenter,
  ) {}

  async execute(offerId: string): Promise<OfferView> {
    const offer = await this.offerRepository.findById(offerId);
    if (!offer) throw new EntityNotFoundError('Oferta', offerId);
    return this.offerPresenter.present(offer);
  }
}
