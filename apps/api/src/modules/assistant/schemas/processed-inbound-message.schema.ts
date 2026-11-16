import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

const RETENTION_SECONDS = 7 * 24 * 60 * 60;

@Schema({ collection: 'processed_inbound_messages' })
export class ProcessedInboundMessageDocument {
  @Prop({ required: true, unique: true })
  messageId: string;

  @Prop({ required: true, expires: RETENTION_SECONDS })
  processedAt: Date;
}

export const ProcessedInboundMessageSchema = SchemaFactory.createForClass(ProcessedInboundMessageDocument);
