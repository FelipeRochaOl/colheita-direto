import { Injectable } from '@nestjs/common';
import { EventHandler } from '../../../shared/queue/event-handler';
import { DomainEvent } from '../../../shared/queue/event-publisher';
import { WHATSAPP_MESSAGE_RECEIVED_EVENT, WhatsAppInboundMessage } from '../services/whatsapp-inbound-message';
import { HandleWhatsAppMessageUseCase } from '../use-cases/handle-whatsapp-message.use-case';

@Injectable()
export class WhatsAppMessageReceivedHandler implements EventHandler {
  readonly queueName = 'notification-events' as const;
  readonly eventType = WHATSAPP_MESSAGE_RECEIVED_EVENT;

  constructor(private readonly handleWhatsAppMessageUseCase: HandleWhatsAppMessageUseCase) {}

  async handle(event: DomainEvent<WhatsAppInboundMessage>): Promise<void> {
    await this.handleWhatsAppMessageUseCase.execute(event.payload);
  }
}
