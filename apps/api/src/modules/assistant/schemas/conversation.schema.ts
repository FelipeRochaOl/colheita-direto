import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { ConversationTurn } from '../entities/conversation.entity';

const CONVERSATION_RETENTION_SECONDS = 30 * 24 * 60 * 60;

@Schema({ collection: 'conversations' })
export class ConversationDocument {
  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ type: [Object], default: [] })
  turns: ConversationTurn[];

  @Prop({ type: [String], default: [] })
  pendingPhotoKeys: string[];

  /** LGPD: conversas sem atividade são apagadas após 30 dias. */
  @Prop({ required: true, expires: CONVERSATION_RETENTION_SECONDS })
  updatedAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(ConversationDocument);
