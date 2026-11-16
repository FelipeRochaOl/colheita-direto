import type { HarvestLotStatus } from '@colheita/contracts';
import { HarvestLot } from '../entities/harvest-lot.entity';

export const HARVEST_LOT_REPOSITORY = Symbol('HARVEST_LOT_REPOSITORY');

export interface HarvestLotTotals {
  lotsClassified: number;
  kilogramsClassified: number;
}

export interface HarvestLotRepository {
  findById(harvestLotId: string): Promise<HarvestLot | null>;
  findByProducer(producerId: string, statuses?: HarvestLotStatus[]): Promise<HarvestLot[]>;
  save(harvestLot: HarvestLot): Promise<void>;
  calculateTotals(): Promise<HarvestLotTotals>;
}
