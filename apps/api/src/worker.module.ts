import { Module } from '@nestjs/common';
import { CoreModule } from './core.module';
import { AssistantModule } from './modules/assistant/assistant.module';
import { WhatsAppMessageReceivedHandler } from './modules/assistant/event-handlers/whatsapp-message-received.handler';
import { HarvestLotCreatedHandler } from './modules/harvest-lots/event-handlers/harvest-lot-created.handler';
import { HarvestLotsModule } from './modules/harvest-lots/harvest-lots.module';
import { EVENT_HANDLERS } from './shared/queue/event-handler';
import { SqsQueueConsumer } from './shared/queue/sqs-queue-consumer';

/** Worker: mesmos módulos e use-cases da API, sem HTTP. Consome as filas SQS. */
@Module({
  imports: [CoreModule, HarvestLotsModule, AssistantModule],
  providers: [
    {
      provide: EVENT_HANDLERS,
      inject: [HarvestLotCreatedHandler, WhatsAppMessageReceivedHandler],
      useFactory: (...handlers) => handlers,
    },
    SqsQueueConsumer,
  ],
})
export class WorkerModule {}
