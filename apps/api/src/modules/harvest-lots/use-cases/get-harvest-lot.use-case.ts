import { Inject, Injectable } from '@nestjs/common';
import type { HarvestLot as HarvestLotView } from '@colheita/contracts';
import { AccessDeniedError, EntityNotFoundError } from '../../../shared/errors/domain-error';
import { HARVEST_LOT_REPOSITORY, HarvestLotRepository } from '../repositories/harvest-lot.repository';
import { HarvestLotPresenter } from '../services/harvest-lot-presenter';

@Injectable()
export class GetHarvestLotUseCase {
  constructor(
    @Inject(HARVEST_LOT_REPOSITORY) private readonly harvestLotRepository: HarvestLotRepository,
    private readonly harvestLotPresenter: HarvestLotPresenter,
  ) {}

  async execute(producerId: string, harvestLotId: string): Promise<HarvestLotView> {
    const harvestLot = await this.harvestLotRepository.findById(harvestLotId);
    if (!harvestLot) throw new EntityNotFoundError('Lote', harvestLotId);
    if (!harvestLot.isOwnedBy(producerId)) throw new AccessDeniedError('Este lote é de outro produtor');
    return this.harvestLotPresenter.present(harvestLot);
  }
}
