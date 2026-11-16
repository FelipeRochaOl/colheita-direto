import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SqsQueueConsumer } from './shared/queue/sqs-queue-consumer';
import { WorkerModule } from './worker.module';

async function bootstrapWorker(): Promise<void> {
  const app = await NestFactory.createApplicationContext(WorkerModule);
  app.enableShutdownHooks();
  const queueConsumer = app.get(SqsQueueConsumer);
  queueConsumer.start();

  const stopGracefully = async () => {
    Logger.log('Encerrando worker...');
    queueConsumer.stop();
    await app.close();
  };
  process.on('SIGTERM', stopGracefully);
  process.on('SIGINT', stopGracefully);
}

void bootstrapWorker();
