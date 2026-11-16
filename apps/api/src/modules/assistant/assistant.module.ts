import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FarmManagementModule } from '../farm-management/farm-management.module';
import { HarvestLotsModule } from '../harvest-lots/harvest-lots.module';
import { LotRoutingModule } from '../lot-routing/lot-routing.module';
import { OrdersModule } from '../orders/orders.module';
import { WhatsAppWebhookController } from './controllers/whatsapp-webhook.controller';
import { WhatsAppMessageReceivedHandler } from './event-handlers/whatsapp-message-received.handler';
import { CONVERSATION_REPOSITORY } from './repositories/conversation.repository';
import { MongoConversationRepository } from './repositories/mongo-conversation.repository';
import { INBOUND_MESSAGE_LEDGER } from './repositories/inbound-message-ledger';
import { MongoInboundMessageLedger } from './repositories/mongo-inbound-message-ledger';
import { ConversationDocument, ConversationSchema } from './schemas/conversation.schema';
import { ProcessedInboundMessageDocument, ProcessedInboundMessageSchema } from './schemas/processed-inbound-message.schema';
import { BedrockClaudeClient } from './services/bedrock-claude-client';
import { LANGUAGE_MODEL_CLIENT } from './services/language-model-client';
import { AUDIO_TRANSCRIBER } from './services/audio-transcriber';
import { AwsTranscribeAudioTranscriber } from './services/aws-transcribe-audio-transcriber';
import { ProducerAssistantAgent } from './services/producer-assistant-agent';
import { WhatsAppMediaDownloader } from './services/whatsapp-media-downloader';
import { WhatsAppWebhookParser } from './services/whatsapp-webhook-parser';
import { ProducerAssistantToolbox } from './tools/producer-assistant-toolbox';
import { HandleWhatsAppMessageUseCase } from './use-cases/handle-whatsapp-message.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConversationDocument.name, schema: ConversationSchema },
      { name: ProcessedInboundMessageDocument.name, schema: ProcessedInboundMessageSchema },
    ]),
    HarvestLotsModule,
    LotRoutingModule,
    FarmManagementModule,
    OrdersModule,
  ],
  controllers: [WhatsAppWebhookController],
  providers: [
    { provide: CONVERSATION_REPOSITORY, useClass: MongoConversationRepository },
    { provide: INBOUND_MESSAGE_LEDGER, useClass: MongoInboundMessageLedger },
    { provide: LANGUAGE_MODEL_CLIENT, useClass: BedrockClaudeClient },
    { provide: AUDIO_TRANSCRIBER, useClass: AwsTranscribeAudioTranscriber },
    WhatsAppWebhookParser,
    WhatsAppMediaDownloader,
    ProducerAssistantToolbox,
    ProducerAssistantAgent,
    HandleWhatsAppMessageUseCase,
    WhatsAppMessageReceivedHandler,
  ],
  exports: [WhatsAppMessageReceivedHandler],
})
export class AssistantModule {}
