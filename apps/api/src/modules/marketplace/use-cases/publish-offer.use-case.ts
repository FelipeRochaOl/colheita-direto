import { Inject, Injectable } from '@nestjs/common';
import type { QualityGrade } from '@colheita/contracts';
import { EntityNotFoundError } from '../../../shared/errors/domain-error';
import { PRODUCER_REPOSITORY, ProducerRepository } from '../../producers/repositories/producer.repository';
import { Offer, OfferChannel } from '../entities/offer.entity';
import { OFFER_REPOSITORY, OfferRepository } from '../repositories/offer.repository';

export interface PublishOfferInput {
  harvestLotId: string;
  producerId: string;
  crop: string;
  grade: QualityGrade;
  channel: OfferChannel;
  boxes: number;
  boxWeightKg: number;
  pricePerBox: number;
  photoKeys: string[];
}

@Injectable()
export class PublishOfferUseCase {
  constructor(
    @Inject(OFFER_REPOSITORY) private readonly offerRepository: OfferRepository,
    @Inject(PRODUCER_REPOSITORY) private readonly producerRepository: ProducerRepository,
  ) {}

  async execute(input: PublishOfferInput): Promise<Offer> {
    const producer = await this.producerRepository.findById(input.producerId);
    if (!producer) throw new EntityNotFoundError('Produtor', input.producerId);

    const offer = Offer.publish({
      harvestLotId: input.harvestLotId,
      producerId: producer.id,
      producerName: producer.name,
      crop: input.crop,
      grade: input.grade,
      channel: input.channel,
      availableBoxes: input.boxes,
      boxWeightKg: input.boxWeightKg,
      pricePerBox: input.pricePerBox,
      photoKeys: input.photoKeys,
      location: producer.farmLocation,
      city: producer.city,
      state: producer.state,
    });
    await this.offerRepository.save(offer);
    return offer;
  }
}
