import { Injectable } from '@nestjs/common';
import { WhatsAppInboundMessage } from './whatsapp-inbound-message';

interface WhatsAppWebhookMessage {
  id: string;
  from: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  image?: { id: string; mime_type: string; caption?: string };
  audio?: { id: string; mime_type: string };
  interactive?: { button_reply?: { id: string; title: string } };
  button?: { payload: string; text: string };
}

export interface WhatsAppWebhookBody {
  entry?: Array<{ changes?: Array<{ value?: { messages?: WhatsAppWebhookMessage[] } }> }>;
}

/** Traduz o payload da Meta para mensagens do domínio. Ignora status de entrega e outros eventos. */
@Injectable()
export class WhatsAppWebhookParser {
  parse(body: WhatsAppWebhookBody): WhatsAppInboundMessage[] {
    const rawMessages = (body.entry ?? []).flatMap((entry) =>
      (entry.changes ?? []).flatMap((change) => change.value?.messages ?? []),
    );
    return rawMessages.map((rawMessage) => this.toInboundMessage(rawMessage));
  }

  private toInboundMessage(rawMessage: WhatsAppWebhookMessage): WhatsAppInboundMessage {
    const base = {
      messageId: rawMessage.id,
      phoneNumber: `+${rawMessage.from}`,
      receivedAt: new Date(Number(rawMessage.timestamp) * 1000).toISOString(),
      text: null,
      mediaId: null,
      mimeType: null,
      buttonReplyId: null,
    };
    switch (rawMessage.type) {
      case 'text':
        return { ...base, type: 'text', text: rawMessage.text?.body ?? '' };
      case 'image':
        return {
          ...base,
          type: 'image',
          mediaId: rawMessage.image!.id,
          mimeType: rawMessage.image!.mime_type,
          text: rawMessage.image!.caption ?? null,
        };
      case 'audio':
        return { ...base, type: 'audio', mediaId: rawMessage.audio!.id, mimeType: rawMessage.audio!.mime_type };
      case 'interactive':
        return {
          ...base,
          type: 'button',
          buttonReplyId: rawMessage.interactive?.button_reply?.id ?? null,
          text: rawMessage.interactive?.button_reply?.title ?? null,
        };
      case 'button':
        return { ...base, type: 'button', buttonReplyId: rawMessage.button?.payload ?? null, text: rawMessage.button?.text ?? null };
      default:
        return { ...base, type: 'unsupported' };
    }
  }
}
