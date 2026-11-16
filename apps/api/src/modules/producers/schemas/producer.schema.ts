import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { GeoPointDocument, GeoPointSchema } from '../../../shared/database/geo-point.schema';

@Schema({ collection: 'producers' })
export class ProducerDocument {
  @Prop({ type: String })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  farmName: string;

  @Prop({ type: GeoPointSchema, required: true, index: '2dsphere' })
  farmLocation: GeoPointDocument;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ type: [String], default: [] })
  crops: string[];

  @Prop({ type: String, default: null })
  familyFarmRegistration: string | null;

  @Prop({ type: String, default: null })
  paymentWalletId: string | null;

  @Prop({ required: true })
  createdAt: Date;
}

export const ProducerSchema = SchemaFactory.createForClass(ProducerDocument);
