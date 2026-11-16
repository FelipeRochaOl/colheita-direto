export interface NotificationButton {
  id: string;
  title: string;
}

/** Template aprovado pela Meta, obrigatório fora da janela de 24h do WhatsApp. */
export interface NotificationTemplate {
  name: string;
  languageCode: string;
  bodyParameters: string[];
}

export interface NotificationMessage {
  text: string;
  buttons?: NotificationButton[];
  template?: NotificationTemplate;
}

export interface NotificationRecipient {
  phoneNumber: string;
  lastWhatsAppInboundAt: Date | null;
}
