import { AppConfigService } from '../../../shared/config/app-config.service';
import { WhatsAppCloudApiChannel } from './whatsapp-cloud-api.channel';

const CONFIG: Record<string, string> = {
  WHATSAPP_GRAPH_API_URL: 'https://graph.facebook.com/v23.0',
  WHATSAPP_PHONE_NUMBER_ID: '123',
  WHATSAPP_ACCESS_TOKEN: 'token-de-teste',
};

describe('WhatsAppCloudApiChannel', () => {
  const appConfig = { get: (key: string) => CONFIG[key] } as unknown as AppConfigService;
  const channel = new WhatsAppCloudApiChannel(appConfig);
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValue({ ok: true, text: async () => '' });
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  const sentBody = () => JSON.parse(fetchMock.mock.calls[0][1].body);
  const outsideWindow = { phoneNumber: '+5511999990000', lastWhatsAppInboundAt: null };

  it('fora da janela de 24h, OTP vai como template com o código no botão "copiar código"', async () => {
    await channel.send(outsideWindow, {
      text: 'código 123456',
      template: { name: 'codigo_de_acesso', languageCode: 'pt_BR', bodyParameters: ['123456'], copyCodeButtonParameter: '123456' },
    });

    expect(sentBody().template.components).toEqual([
      { type: 'body', parameters: [{ type: 'text', text: '123456' }] },
      { type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: '123456' }] },
    ]);
  });

  it('template comum leva só os parâmetros do corpo', async () => {
    await channel.send(outsideWindow, {
      text: 'novo pedido',
      template: { name: 'novo_pedido', languageCode: 'pt_BR', bodyParameters: ['10 cx tomate'] },
    });

    expect(sentBody().template.components).toEqual([
      { type: 'body', parameters: [{ type: 'text', text: '10 cx tomate' }] },
    ]);
  });

  it('dentro da janela de 24h envia texto livre', async () => {
    await channel.send({ ...outsideWindow, lastWhatsAppInboundAt: new Date() }, { text: 'olá' });
    expect(sentBody()).toMatchObject({ type: 'text', text: { body: 'olá' } });
  });
});
