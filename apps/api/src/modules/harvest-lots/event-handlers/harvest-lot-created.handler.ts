import { Injectable } from '@nestjs/common';
import { EventHandler } from '../../../shared/queue/event-handler';
import { DomainEvent } from '../../../shared/queue/event-publisher';
import { HARVEST_LOT_CREATED_EVENT } from '../use-cases/create-harvest-lot.use-case';
import { ClassifyHarvestLotUseCase } from '../use-cases/classify-harvest-lot.use-case';

@Injectable()
export class HarvestLotCreatedHandler implements EventHandler {
  readonly queueName = 'harvest-lot-events' as const;
  readonly eventType = HARVEST_LOT_CREATED_EVENT;

  constructor(private readonly classifyHarvestLotUseCase: ClassifyHarvestLotUseCase) {}

  async handle(event: DomainEvent<{ harvestLotId: string }>): Promise<void> {
    await this.classifyHarvestLotUseCase.execute(event.payload.harvestLotId);
  }
}
