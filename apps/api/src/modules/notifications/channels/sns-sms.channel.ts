import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../../shared/config/app-config.service';
import { NotificationMessage, NotificationRecipient } from '../notification-message';
import { NotificationChannel } from './notification-channel';

const SMS_MAX_LENGTH = 300;

/** SMS via Amazon SNS: alternativa para quem não usa WhatsApp ou está sem dados móveis. */
@Injectable()
export class SnsSmsChannel implements NotificationChannel {
  readonly channelName = 'sms';
  readonly priority = 2;
  private readonly snsClient: SNSClient;

  constructor(private readonly appConfig: AppConfigService) {
    this.snsClient = new SNSClient({ region: appConfig.get('AWS_REGION') });
  }

  isAvailable(): boolean {
    return this.appConfig.get('SMS_ENABLED');
  }

  async send(recipient: NotificationRecipient, message: NotificationMessage): Promise<void> {
    await this.snsClient.send(
      new PublishCommand({
        PhoneNumber: recipient.phoneNumber,
        Message: message.text.slice(0, SMS_MAX_LENGTH),
        MessageAttributes: {
          'AWS.SNS.SMS.SMSType': { DataType: 'String', StringValue: 'Transactional' },
        },
      }),
    );
  }
}
