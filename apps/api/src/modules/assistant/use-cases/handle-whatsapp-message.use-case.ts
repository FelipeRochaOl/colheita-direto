import { Inject, Injectable, Logger } from '@nestjs/common';
import type { LotDestination } from '@colheita/contracts';
import { AppConfigService } from '../../../shared/config/app-config.service';
import { PHOTO_STORAGE, PhotoStorage } from '../../../shared/storage/photo-storage';
import { User } from '../../identity/entities/user.entity';
import { USER_REPOSITORY, UserRepository } from '../../identity/repositories/user.repository';
import { ConfirmLotDestinationUseCase } from '../../lot-routing/use-cases/confirm-lot-destination.use-case';
import { WhatsAppCloudApiChannel } from '../../notifications/channels/whatsapp-cloud-api.channel';
import { AcceptOrderUseCase } from '../../orders/use-cases/accept-order.use-case';
import { Conversation } from '../entities/conversation.entity';
import { brazilianPhoneNumberVariants } from '../../../shared/phone/brazilian-phone-number';
import { CONVERSATION_REPOSITORY, ConversationRepository } from '../repositories/conversation.repository';
import { INBOUND_MESSAGE_LEDGER, InboundMessageLedger } from '../repositories/inbound-message-ledger';
import { AUDIO_TRANSCRIBER, AudioTranscriber } from '../services/audio-transcriber';
import { ProducerAssistantAgent } from '../services/producer-assistant-agent';
import { WhatsAppInboundMessage } from '../services/whatsapp-inbound-message';
import { WhatsAppMediaDownloader } from '../services/whatsapp-media-downloader';

/**
 * Trata cada mensagem recebida no WhatsApp:
 * botões → ação direta; foto → guardada para o próximo lote; áudio → transcrição; texto → agente Claude.
 */
@Injectable()
export class HandleWhatsAppMessageUseCase {
  private readonly logger = new Logger(HandleWhatsAppMessageUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(CONVERSATION_REPOSITORY) private readonly conversationRepository: ConversationRepository,
    @Inject(INBOUND_MESSAGE_LEDGER) private readonly inboundMessageLedger: InboundMessageLedger,
    @Inject(PHOTO_STORAGE) private readonly photoStorage: PhotoStorage,
    @Inject(AUDIO_TRANSCRIBER) private readonly audioTranscriber: AudioTranscriber,
    private readonly mediaDownloader: WhatsAppMediaDownloader,
    private readonly producerAssistantAgent: ProducerAssistantAgent,
    private readonly confirmLotDestinationUseCase: ConfirmLotDestinationUseCase,
    private readonly acceptOrderUseCase: AcceptOrderUseCase,
    private readonly whatsAppChannel: WhatsAppCloudApiChannel,
    private readonly appConfig: AppConfigService,
  ) {}

  async execute(message: WhatsAppInboundMessage): Promise<void> {
    // Mensagem repetida (reentrega da Meta ou do SQS) não roda o turno de novo.
    if (!(await this.inboundMessageLedger.tryRegister(message.messageId))) return;

    const user = await this.findUser(message.phoneNumber);
    if (!user?.hasRole('producer')) {
      await this.sendReply(
        message.phoneNumber,
        `Olá! Para vender sua colheita pela Colheita Direta, faça seu cadastro em ${this.appConfig.get('WEB_APP_URL')}/cadastro. Leva 2 minutos.`,
      );
      return;
    }
    user.recordWhatsAppInbound(new Date(message.receivedAt));
    await this.userRepository.save(user);

    const conversation =
      (await this.conversationRepository.findByPhoneNumber(message.phoneNumber)) ?? Conversation.start(message.phoneNumber);
    const reply = await this.buildReply(user, conversation, message);
    await this.conversationRepository.save(conversation);
    if (reply) await this.sendReply(message.phoneNumber, reply);
  }

  private async findUser(phoneNumber: string): Promise<User | null> {
    for (const candidate of brazilianPhoneNumberVariants(phoneNumber)) {
      const user = await this.userRepository.findByPhoneNumber(candidate);
      if (user) return user;
    }
    return null;
  }

  /** O turno já foi executado e registrado: falha no envio só é logada, nunca reexecuta as tools. */
  private async sendReply(phoneNumber: string, text: string): Promise<void> {
    try {
      await this.whatsAppChannel.sendTextReply(phoneNumber, text);
    } catch (error) {
      this.logger.error(`Falha ao responder ${phoneNumber} no WhatsApp`, error as Error);
    }
  }

  private async buildReply(user: User, conversation: Conversation, message: WhatsAppInboundMessage): Promise<string | null> {
    switch (message.type) {
      case 'button':
        return this.handleButton(user, conversation, message);
      case 'image':
        return this.handleImage(user, conversation, message);
      case 'audio':
        return this.handleAudio(user, conversation, message);
      case 'text':
        return this.askAgent(user, conversation, message.text ?? '');
      default:
        return 'Por enquanto entendo texto, áudio e fotos.';
    }
  }

  private async handleButton(user: User, conversation: Conversation, message: WhatsAppInboundMessage): Promise<string> {
    const [action, entityId, destination] = (message.buttonReplyId ?? '').split(':');
    try {
      if (action === 'confirm-destination') {
        await this.confirmLotDestinationUseCase.execute(user.id, entityId, { destination: destination as LotDestination });
        return 'Pronto! Lote encaminhado. Aviso aqui quando aparecer comprador ou organização interessada.';
      }
      if (action === 'accept-order') {
        await this.acceptOrderUseCase.execute(user.id, entityId);
        return 'Pedido aceito! Separe as caixas para a coleta.';
      }
    } catch (error) {
      return `Não consegui concluir: ${(error as Error).message}`;
    }
    if (action === 'choose-destination') {
      return this.askAgent(user, conversation, `Quero escolher outro destino para o lote ${entityId}. Quais são as opções?`);
    }
    return this.askAgent(user, conversation, message.text ?? '');
  }

  private async handleImage(user: User, conversation: Conversation, message: WhatsAppInboundMessage): Promise<string | null> {
    const media = await this.mediaDownloader.download(message.mediaId!);
    const photoKey = await this.photoStorage.savePhoto(user.id, media.content, media.mimeType);
    conversation.addPendingPhoto(photoKey);
    if (message.text) {
      return this.askAgent(user, conversation, `[Enviei uma foto do lote] ${message.text}`);
    }
    // Várias fotos chegam em sequência: responde só na primeira para não lotar o chat.
    if (conversation.pendingPhotoKeys.length > 1) return null;
    return this.askAgent(user, conversation, '[Enviei uma foto do lote]');
  }

  private async handleAudio(user: User, conversation: Conversation, message: WhatsAppInboundMessage): Promise<string> {
    try {
      const media = await this.mediaDownloader.download(message.mediaId!);
      const transcript = await this.audioTranscriber.transcribe(media.content, media.mimeType);
      return this.askAgent(user, conversation, transcript);
    } catch (error) {
      this.logger.warn('Falha ao transcrever áudio', error as Error);
      return 'Não consegui ouvir o áudio direito. Pode mandar de novo ou escrever?';
    }
  }

  private async askAgent(user: User, conversation: Conversation, userText: string): Promise<string> {
    const reply = await this.producerAssistantAgent.reply(conversation.turns, userText, {
      producerId: user.id,
      conversation,
    });
    conversation.addTurn({ role: 'user', text: userText });
    conversation.addTurn({ role: 'assistant', text: reply });
    return reply;
  }
}
