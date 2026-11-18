import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '../../../shared/config/app-config.service';
import { NotificationMessage, NotificationRecipient, NotificationTemplate } from '../notification-message';
import { NotificationChannel } from './notification-channel';

const CONVERSATION_WINDOW_MILLISECONDS = 24 * 60 * 60 * 1000;

/** Envio direto pela WhatsApp Cloud API (Graph API da Meta), sem BSP. */
@Injectable()
export class WhatsAppCloudApiChannel implements NotificationChannel {
  readonly channelName = 'whatsapp';
  readonly priority = 1;
  private readonly logger = new Logger(WhatsAppCloudApiChannel.name);

  constructor(private readonly appConfig: AppConfigService) {}

  isAvailable(): boolean {
    return Boolean(this.appConfig.get('WHATSAPP_PHONE_NUMBER_ID') && this.appConfig.get('WHATSAPP_ACCESS_TOKEN'));
  }

  async send(recipient: NotificationRecipient, message: NotificationMessage): Promise<void> {
    const recipientNumber = recipient.phoneNumber.replace('+', '');
    const body = this.isInsideConversationWindow(recipient)
      ? this.buildSessionMessage(recipientNumber, message)
      : this.buildTemplateMessage(recipientNumber, message);

    if (!body) {
      this.logger.warn(`Fora da janela de 24h e sem template: mensagem para ${recipient.phoneNumber} não enviada`);
      return;
    }
    await this.postToGraphApi(body);
  }

  async sendTextReply(phoneNumber: string, text: string): Promise<void> {
    await this.postToGraphApi(this.buildSessionMessage(phoneNumber.replace('+', ''), { text }));
  }

  private isInsideConversationWindow(recipient: NotificationRecipient): boolean {
    if (!recipient.lastWhatsAppInboundAt) return false;
    return Date.now() - recipient.lastWhatsAppInboundAt.getTime() < CONVERSATION_WINDOW_MILLISECONDS;
  }

  private buildSessionMessage(recipientNumber: string, message: NotificationMessage) {
    const base = { messaging_product: 'whatsapp', to: recipientNumber };
    if (!message.buttons?.length) {
      return { ...base, type: 'text', text: { body: message.text } };
    }
    return {
      ...base,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: message.text },
        action: {
          buttons: message.buttons.slice(0, 3).map((button) => ({
            type: 'reply',
            reply: { id: button.id, title: button.title.slice(0, 20) },
          })),
        },
      },
    };
  }

  private buildTemplateMessage(recipientNumber: string, message: NotificationMessage) {
    if (!message.template) return null;
    return {
      messaging_product: 'whatsapp',
      to: recipientNumber,
      type: 'template',
      template: {
        name: message.template.name,
        language: { code: message.template.languageCode },
        components: this.buildTemplateComponents(message.template),
      },
    };
  }

  private buildTemplateComponents(template: NotificationTemplate) {
    const components: object[] = [
      {
        type: 'body',
        parameters: template.bodyParameters.map((parameter) => ({ type: 'text', text: parameter })),
      },
    ];
    // Template de autenticação: o botão "copiar código" é o índice 0 e recebe o mesmo código.
    if (template.copyCodeButtonParameter) {
      components.push({
        type: 'button',
        sub_type: 'url',
        index: '0',
        parameters: [{ type: 'text', text: template.copyCodeButtonParameter }],
      });
    }
    return components;
  }

  private async postToGraphApi(body: object): Promise<void> {
    const url = `${this.appConfig.get('WHATSAPP_GRAPH_API_URL')}/${this.appConfig.get('WHATSAPP_PHONE_NUMBER_ID')}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.appConfig.get('WHATSAPP_ACCESS_TOKEN')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`WhatsApp Cloud API respondeu ${response.status}: ${await response.text()}`);
    }
  }
}
