import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '../../../shared/config/app-config.service';
import { NotificationMessage, NotificationRecipient } from '../notification-message';
import { NotificationChannel } from './notification-channel';

/**
 * Canal de desenvolvimento: só escreve no log. Nunca existe em produção,
 * porque a mensagem pode conter o código de acesso (OTP).
 */
@Injectable()
export class LogOnlyChannel implements NotificationChannel {
  readonly channelName = 'log';
  readonly priority = 99;
  private readonly logger = new Logger('Notificação');

  constructor(private readonly appConfig: AppConfigService) {}

  isAvailable(): boolean {
    return this.appConfig.get('NODE_ENV') !== 'production';
  }

  async send(recipient: NotificationRecipient, message: NotificationMessage): Promise<void> {
    const buttons = message.buttons?.map((button) => `[${button.title}]`).join(' ') ?? '';
    this.logger.log(`→ ${recipient.phoneNumber}: ${message.text} ${buttons}`);
  }
}
