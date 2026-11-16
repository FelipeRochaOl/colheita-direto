import { Inject, Injectable, Logger } from '@nestjs/common';
import { NOTIFICATION_CHANNELS, NotificationChannel } from '../channels/notification-channel';
import { NotificationMessage, NotificationRecipient } from '../notification-message';

/** Envia pelo melhor canal disponível e tenta o próximo se um falhar. */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(@Inject(NOTIFICATION_CHANNELS) private readonly channels: NotificationChannel[]) {}

  async notify(recipient: NotificationRecipient, message: NotificationMessage): Promise<void> {
    const availableChannels = this.channels
      .filter((channel) => channel.isAvailable())
      .sort((first, second) => first.priority - second.priority);

    for (const channel of availableChannels) {
      try {
        await channel.send(recipient, message);
        return;
      } catch (error) {
        this.logger.warn(`Canal ${channel.channelName} falhou; tentando o próximo`, error as Error);
      }
    }
    this.logger.error(`Nenhum canal conseguiu notificar ${recipient.phoneNumber}`);
  }
}
