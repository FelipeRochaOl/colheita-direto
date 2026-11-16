import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../config/app-config.service';
import { EventQueueName } from './event-publisher';

@Injectable()
export class QueueUrlResolver {
  constructor(private readonly appConfig: AppConfigService) {}

  resolve(queueName: EventQueueName): string {
    const queueUrls: Record<EventQueueName, string> = {
      'harvest-lot-events': this.appConfig.get('HARVEST_LOT_EVENTS_QUEUE_URL'),
      'notification-events': this.appConfig.get('NOTIFICATION_EVENTS_QUEUE_URL'),
    };
    return queueUrls[queueName];
  }
}
