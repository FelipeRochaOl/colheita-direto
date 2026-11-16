import { Inject, Injectable } from '@nestjs/common';
import type { CreateHarvestLotInput } from '@colheita/contracts';
import { AccessDeniedError } from '../../../shared/errors/domain-error';
import { EVENT_PUBLISHER, EventPublisher } from '../../../shared/queue/event-publisher';
import { HarvestLot } from '../entities/harvest-lot.entity';
import { HARVEST_LOT_REPOSITORY, HarvestLotRepository } from '../repositories/harvest-lot.repository';

export const HARVEST_LOT_CREATED_EVENT = 'harvest-lot.created';

/** Registra o lote e dispara a classificação assíncrona (worker → serviço de visão). */
@Injectable()
export class CreateHarvestLotUseCase {
  constructor(
    @Inject(HARVEST_LOT_REPOSITORY) private readonly harvestLotRepository: HarvestLotRepository,
    @Inject(EVENT_PUBLISHER) private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(producerId: string, input: CreateHarvestLotInput): Promise<HarvestLot> {
    const photosBelongToProducer = input.photoKeys.every((photoKey) =>
      photoKey.startsWith(`harvest-photos/${producerId}/`),
    );
    if (!photosBelongToProducer) throw new AccessDeniedError('Foto não pertence a este produtor');

    const harvestLot = HarvestLot.create({
      producerId,
      crop: input.crop,
      quantityBoxes: input.quantityBoxes,
      boxWeightKg: input.boxWeightKg,
      photoKeys: input.photoKeys,
      harvestedAt: new Date(input.harvestedAt),
    });
    await this.harvestLotRepository.save(harvestLot);
    await this.eventPublisher.publish('harvest-lot-events', HARVEST_LOT_CREATED_EVENT, {
      harvestLotId: harvestLot.id,
    });
    return harvestLot;
  }
}
