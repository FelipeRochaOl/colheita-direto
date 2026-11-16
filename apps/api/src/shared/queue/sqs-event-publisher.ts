import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../config/app-config.service';
import { buildAwsClientOptions } from '../storage/aws-client-options';
import { DomainEvent, EventPublisher, EventQueueName } from './event-publisher';
import { QueueUrlResolver } from './queue-url-resolver';

@Injectable()
export class SqsEventPublisher implements EventPublisher {
  private readonly sqsClient: SQSClient;

  constructor(
    appConfig: AppConfigService,
    private readonly queueUrlResolver: QueueUrlResolver,
  ) {
    this.sqsClient = new SQSClient(buildAwsClientOptions(appConfig));
  }

  async publish(queueName: EventQueueName, eventType: string, payload: Record<string, unknown>): Promise<void> {
    const event: DomainEvent = { type: eventType, payload, occurredAt: new Date().toISOString() };
    await this.sqsClient.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrlResolver.resolve(queueName),
        MessageBody: JSON.stringify(event),
      }),
    );
  }
}
