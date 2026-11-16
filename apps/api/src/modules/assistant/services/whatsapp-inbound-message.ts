/** Mensagem recebida do WhatsApp, já normalizada pelo webhook. */
export interface WhatsAppInboundMessage {
  messageId: string;
  phoneNumber: string;
  receivedAt: string;
  type: 'text' | 'image' | 'audio' | 'button' | 'unsupported';
  text: string | null;
  mediaId: string | null;
  mimeType: string | null;
  buttonReplyId: string | null;
}

export const WHATSAPP_MESSAGE_RECEIVED_EVENT = 'whatsapp.message-received';
