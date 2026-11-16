import { ForbiddenException } from '@nestjs/common';
import { createHmac } from 'node:crypto';
import { AppConfigService } from '../../../shared/config/app-config.service';
import { EventPublisher } from '../../../shared/queue/event-publisher';
import { WhatsAppWebhookParser } from '../services/whatsapp-webhook-parser';
import { WhatsAppWebhookController } from './whatsapp-webhook.controller';

const APP_SECRET = 'segredo-do-app-meta';

const webhookBody = {
  entry: [
    {
      changes: [
        {
          value: {
            messages: [
              { id: 'wamid.1', from: '5511911110001', timestamp: '1763300000', type: 'text', text: { body: 'colhi 40 caixas' } },
              { id: 'wamid.2', from: '5511911110001', timestamp: '1763300005', type: 'image', image: { id: 'media-1', mime_type: 'image/jpeg' } },
              {
                id: 'wamid.3',
                from: '5511911110001',
                timestamp: '1763300010',
                type: 'interactive',
                interactive: { button_reply: { id: 'confirm-destination:lot-1:MARKETPLACE', title: 'Confirmar' } },
              },
            ],
          },
        },
      ],
    },
  ],
};

function sign(rawBody: Buffer): string {
  return `sha256=${createHmac('sha256', APP_SECRET).update(rawBody).digest('hex')}`;
}

describe('WhatsAppWebhookController', () => {
  const publish = jest.fn().mockResolvedValue(undefined);
  const appConfig = {
    get: (key: string) => ({ WHATSAPP_APP_SECRET: APP_SECRET, WHATSAPP_VERIFY_TOKEN: 'token-de-verificacao' })[key],
  } as unknown as AppConfigService;
  const controller = new WhatsAppWebhookController(appConfig, new WhatsAppWebhookParser(), {
    publish,
  } as EventPublisher);
  const rawBody = Buffer.from(JSON.stringify(webhookBody));

  beforeEach(() => publish.mockClear());

  it('aceita payload assinado e publica uma mensagem normalizada por evento', async () => {
    await controller.receive({ rawBody, body: webhookBody } as never, sign(rawBody));

    expect(publish).toHaveBeenCalledTimes(3);
    const published = publish.mock.calls.map(([, , payload]) => payload);
    expect(published[0]).toMatchObject({ phoneNumber: '+5511911110001', type: 'text', text: 'colhi 40 caixas' });
    expect(published[1]).toMatchObject({ type: 'image', mediaId: 'media-1', mimeType: 'image/jpeg' });
    expect(published[2]).toMatchObject({ type: 'button', buttonReplyId: 'confirm-destination:lot-1:MARKETPLACE' });
  });

  it('rejeita payload com assinatura errada, alterado ou sem assinatura', async () => {
    const tamperedBody = Buffer.from(JSON.stringify({ ...webhookBody, extra: true }));
    await expect(controller.receive({ rawBody: tamperedBody, body: webhookBody } as never, sign(rawBody))).rejects.toThrow(ForbiddenException);
    await expect(controller.receive({ rawBody, body: webhookBody } as never, 'sha256=abc')).rejects.toThrow(ForbiddenException);
    await expect(controller.receive({ rawBody, body: webhookBody } as never, undefined)).rejects.toThrow(ForbiddenException);
    expect(publish).not.toHaveBeenCalled();
  });

  it('responde ao desafio de verificação da Meta só com o token correto', () => {
    expect(controller.verify('subscribe', 'token-de-verificacao', 'desafio-123')).toBe('desafio-123');
    expect(() => controller.verify('subscribe', 'token-errado', 'desafio-123')).toThrow(ForbiddenException);
  });
});
