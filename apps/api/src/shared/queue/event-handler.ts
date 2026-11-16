import { DomainEvent, EventQueueName } from './event-publisher';

/** Cada consumidor do worker implementa esta interface para um tipo de evento. */
export interface EventHandler<Payload = unknown> {
  readonly queueName: EventQueueName;
  readonly eventType: string;
  handle(event: DomainEvent<Payload>): Promise<void>;
}

export const EVENT_HANDLERS = Symbol('EVENT_HANDLERS');
