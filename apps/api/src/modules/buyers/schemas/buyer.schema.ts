import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BUYER_TYPES } from '@colheita/contracts';
import type { BuyerType } from '@colheita/contracts';
import { GeoPointDocument, GeoPointSchema } from '../../../shared/database/geo-point.schema';

@Schema({ collection: 'buyers' })
export class BuyerDocument {
  @Prop({ type: String })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: String, enum: BUYER_TYPES, required: true })
  buyerType: BuyerType;

  @Prop({ required: true })
  document: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ type: GeoPointSchema, required: true, index: '2dsphere' })
  deliveryLocation: GeoPointDocument;

  @Prop({ required: true })
  deliveryAddress: string;

  @Prop({ type: String, default: null })
  paymentCustomerId: string | null;

  @Prop({ required: true })
  createdAt: Date;
}

export const BuyerSchema = SchemaFactory.createForClass(BuyerDocument);
