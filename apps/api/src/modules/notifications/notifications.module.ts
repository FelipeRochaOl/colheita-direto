import { Global, Module } from '@nestjs/common';
import { LogOnlyChannel } from './channels/log-only.channel';
import { NOTIFICATION_CHANNELS } from './channels/notification-channel';
import { SnsSmsChannel } from './channels/sns-sms.channel';
import { WhatsAppCloudApiChannel } from './channels/whatsapp-cloud-api.channel';
import { NotificationService } from './services/notification.service';

@Global()
@Module({
  providers: [
    WhatsAppCloudApiChannel,
    SnsSmsChannel,
    LogOnlyChannel,
    {
      provide: NOTIFICATION_CHANNELS,
      inject: [WhatsAppCloudApiChannel, SnsSmsChannel, LogOnlyChannel],
      useFactory: (...channels) => channels,
    },
    NotificationService,
  ],
  exports: [NotificationService, WhatsAppCloudApiChannel],
})
export class NotificationsModule {}
