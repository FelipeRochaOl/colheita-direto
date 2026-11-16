import { Inject, Injectable } from '@nestjs/common';
import type { HarvestLot as HarvestLotView, HarvestLotStatus } from '@colheita/contracts';
import { HARVEST_LOT_REPOSITORY, HarvestLotRepository } from '../repositories/harvest-lot.repository';
import { HarvestLotPresenter } from '../services/harvest-lot-presenter';

@Injectable()
export class ListProducerHarvestLotsUseCase {
  constructor(
    @Inject(HARVEST_LOT_REPOSITORY) private readonly harvestLotRepository: HarvestLotRepository,
    private readonly harvestLotPresenter: HarvestLotPresenter,
  ) {}

  async execute(producerId: string, statuses?: HarvestLotStatus[]): Promise<HarvestLotView[]> {
    const harvestLots = await this.harvestLotRepository.findByProducer(producerId, statuses);
    return Promise.all(harvestLots.map((harvestLot) => this.harvestLotPresenter.present(harvestLot)));
  }
}
