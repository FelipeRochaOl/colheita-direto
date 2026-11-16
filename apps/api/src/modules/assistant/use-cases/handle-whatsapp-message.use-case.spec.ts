import { AppConfigService } from '../../../shared/config/app-config.service';
import { PhotoStorage } from '../../../shared/storage/photo-storage';
import { User } from '../../identity/entities/user.entity';
import { UserRepository } from '../../identity/repositories/user.repository';
import { ConfirmLotDestinationUseCase } from '../../lot-routing/use-cases/confirm-lot-destination.use-case';
import { WhatsAppCloudApiChannel } from '../../notifications/channels/whatsapp-cloud-api.channel';
import { AcceptOrderUseCase } from '../../orders/use-cases/accept-order.use-case';
import { Conversation } from '../entities/conversation.entity';
import { ConversationRepository } from '../repositories/conversation.repository';
import { InboundMessageLedger } from '../repositories/inbound-message-ledger';
import { AudioTranscriber } from '../services/audio-transcriber';
import { ProducerAssistantAgent } from '../services/producer-assistant-agent';
import { WhatsAppInboundMessage } from '../services/whatsapp-inbound-message';
import { WhatsAppMediaDownloader } from '../services/whatsapp-media-downloader';
import { HandleWhatsAppMessageUseCase } from './handle-whatsapp-message.use-case';

class InMemoryInboundMessageLedger implements InboundMessageLedger {
  private readonly processedMessageIds = new Set<string>();
  async tryRegister(messageId: string) {
    if (this.processedMessageIds.has(messageId)) return false;
    this.processedMessageIds.add(messageId);
    return true;
  }
}

function createProducer(phoneNumber: string): User {
  const user = User.createFromPhone(phoneNumber);
  user.grantRole('producer', 'João', 'teste');
  return user;
}

describe('HandleWhatsAppMessageUseCase', () => {
  const registeredProducer = createProducer('+5511991111001');
  const userRepository: UserRepository = {
    findById: jest.fn(),
    findByPhoneNumber: jest.fn(async (phoneNumber: string) =>
      phoneNumber === registeredProducer.phoneNumber ? registeredProducer : null,
    ),
    save: jest.fn(),
  };
  const conversationRepository: ConversationRepository = { findByPhoneNumber: jest.fn(async () => null), save: jest.fn() };
  let agentReply: jest.Mock;
  let sendTextReply: jest.Mock;
  let useCase: HandleWhatsAppMessageUseCase;

  const textMessage = (messageId: string, phoneNumber: string): WhatsAppInboundMessage => ({
    messageId,
    phoneNumber,
    receivedAt: new Date().toISOString(),
    type: 'text',
    text: 'quanto lucrei?',
    mediaId: null,
    mimeType: null,
    buttonReplyId: null,
  });

  beforeEach(() => {
    agentReply = jest.fn().mockResolvedValue('Seu lucro foi R$ 10,00.');
    sendTextReply = jest.fn().mockResolvedValue(undefined);
    useCase = new HandleWhatsAppMessageUseCase(
      userRepository,
      conversationRepository,
      new InMemoryInboundMessageLedger(),
      {} as PhotoStorage,
      {} as AudioTranscriber,
      {} as WhatsAppMediaDownloader,
      { reply: agentReply } as unknown as ProducerAssistantAgent,
      {} as ConfirmLotDestinationUseCase,
      {} as AcceptOrderUseCase,
      { sendTextReply } as unknown as WhatsAppCloudApiChannel,
      { get: () => 'http://localhost:5173' } as unknown as AppConfigService,
    );
  });

  it('a mesma mensagem entregue duas vezes executa o agente uma única vez', async () => {
    const message = textMessage('wamid.repetida', registeredProducer.phoneNumber);

    await useCase.execute(message);
    await useCase.execute(message);

    expect(agentReply).toHaveBeenCalledTimes(1);
    expect(sendTextReply).toHaveBeenCalledTimes(1);
  });

  it('falha ao enviar a resposta não propaga o erro (o SQS não reexecuta as tools)', async () => {
    sendTextReply.mockRejectedValue(new Error('Graph API fora do ar'));

    await expect(useCase.execute(textMessage('wamid.falha-envio', registeredProducer.phoneNumber))).resolves.toBeUndefined();
    expect(agentReply).toHaveBeenCalledTimes(1);
  });

  it('reconhece o produtor quando o WhatsApp manda o número sem o 9º dígito', async () => {
    await useCase.execute(textMessage('wamid.sem-nove', '+551191111001'));

    expect(agentReply).toHaveBeenCalledWith(
      expect.any(Array),
      'quanto lucrei?',
      expect.objectContaining({ producerId: registeredProducer.id, conversation: expect.any(Conversation) }),
    );
  });
});
