import { NotificationMessage, NotificationRecipient } from '../notification-message';

export const NOTIFICATION_CHANNELS = Symbol('NOTIFICATION_CHANNELS');

/** Um canal de envio. Novo canal = nova classe; nada muda em quem envia. */
export interface NotificationChannel {
  readonly channelName: string;
  /** Ordem de preferência: menor número é tentado primeiro. */
  readonly priority: number;
  isAvailable(): boolean;
  send(recipient: NotificationRecipient, message: NotificationMessage): Promise<void>;
}
