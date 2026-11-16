import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { USER_ROLES } from '@colheita/contracts';
import type { UserRole } from '@colheita/contracts';

@Schema({ collection: 'users', timestamps: false })
export class UserDocument {
  @Prop({ type: String })
  _id: string;

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ type: String, default: null })
  name: string | null;

  @Prop({ type: [String], enum: USER_ROLES, default: [] })
  roles: UserRole[];

  @Prop({ type: Object, default: null })
  privacyConsent: { policyVersion: string; acceptedAt: Date } | null;

  @Prop({ type: Date, default: null })
  lastWhatsAppInboundAt: Date | null;

  @Prop({ required: true })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
