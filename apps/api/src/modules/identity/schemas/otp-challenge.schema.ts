import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'otp_challenges' })
export class OtpChallengeDocument {
  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ required: true })
  codeHash: string;

  /** Índice TTL: o MongoDB apaga o desafio automaticamente quando expira. */
  @Prop({ required: true, expires: 0 })
  expiresAt: Date;

  @Prop({ default: 0 })
  failedAttempts: number;
}

export const OtpChallengeSchema = SchemaFactory.createForClass(OtpChallengeDocument);
