export const EVENT_PUBLISHER = Symbol('EVENT_PUBLISHER');

/** Fila de destino de cada evento. */
export type EventQueueName = 'harvest-lot-events' | 'notification-events';

export interface DomainEvent<Payload = unknown> {
  type: string;
  payload: Payload;
  occurredAt: string;
}

export interface EventPublisher {
  publish(queueName: EventQueueName, eventType: string, payload: Record<string, unknown>): Promise<void>;
}
