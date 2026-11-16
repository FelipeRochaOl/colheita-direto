import { Global, Module } from '@nestjs/common';
import { EVENT_PUBLISHER } from './event-publisher';
import { QueueUrlResolver } from './queue-url-resolver';
import { SqsEventPublisher } from './sqs-event-publisher';

@Global()
@Module({
  providers: [QueueUrlResolver, { provide: EVENT_PUBLISHER, useClass: SqsEventPublisher }],
  exports: [QueueUrlResolver, EVENT_PUBLISHER],
})
export class QueueModule {}
