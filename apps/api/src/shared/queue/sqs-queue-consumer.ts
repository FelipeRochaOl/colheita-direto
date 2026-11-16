import { DeleteMessageCommand, ReceiveMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '../config/app-config.service';
import { buildAwsClientOptions } from '../storage/aws-client-options';
import { EVENT_HANDLERS, EventHandler } from './event-handler';
import { DomainEvent, EventQueueName } from './event-publisher';
import { QueueUrlResolver } from './queue-url-resolver';

/**
 * Lê as filas SQS em long polling e entrega cada evento ao handler do seu tipo.
 * Mensagem com erro não é apagada: o SQS reentrega e, após 3 tentativas, move para a DLQ.
 */
@Injectable()
export class SqsQueueConsumer {
  private readonly logger = new Logger(SqsQueueConsumer.name);
  private readonly sqsClient: SQSClient;
  private isRunning = false;

  constructor(
    appConfig: AppConfigService,
    private readonly queueUrlResolver: QueueUrlResolver,
    @Inject(EVENT_HANDLERS) private readonly eventHandlers: EventHandler<never>[],
  ) {
    this.sqsClient = new SQSClient(buildAwsClientOptions(appConfig));
  }

  start(): void {
    this.isRunning = true;
    const queueNames = [...new Set(this.eventHandlers.map((handler) => handler.queueName))];
    for (const queueName of queueNames) {
      void this.pollQueue(queueName);
    }
    this.logger.log(`Consumindo filas: ${queueNames.join(', ')}`);
  }

  stop(): void {
    this.isRunning = false;
  }

  private async pollQueue(queueName: EventQueueName): Promise<void> {
    const queueUrl = this.queueUrlResolver.resolve(queueName);
    while (this.isRunning) {
      try {
        const response = await this.sqsClient.send(
          new ReceiveMessageCommand({ QueueUrl: queueUrl, MaxNumberOfMessages: 10, WaitTimeSeconds: 20 }),
        );
        for (const message of response.Messages ?? []) {
          const wasHandled = await this.handleMessage(queueName, message.Body ?? '{}');
          if (wasHandled) {
            await this.sqsClient.send(
              new DeleteMessageCommand({ QueueUrl: queueUrl, ReceiptHandle: message.ReceiptHandle }),
            );
          }
        }
      } catch (error) {
        this.logger.error(`Falha ao ler a fila ${queueName}`, error as Error);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  private async handleMessage(queueName: EventQueueName, messageBody: string): Promise<boolean> {
    const event = JSON.parse(messageBody) as DomainEvent;
    const handler = this.eventHandlers.find(
      (candidate) => candidate.queueName === queueName && candidate.eventType === event.type,
    );
    if (!handler) {
      this.logger.warn(`Nenhum handler para o evento ${event.type}; descartado`);
      return true;
    }
    try {
      await handler.handle(event as DomainEvent<never>);
      return true;
    } catch (error) {
      this.logger.error(`Erro ao processar ${event.type}`, error as Error);
      return false;
    }
  }
}
