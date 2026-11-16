import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { GeoPointDocument, GeoPointSchema } from '../../../shared/database/geo-point.schema';

@Schema({ collection: 'ngos' })
export class NgoDocument {
  @Prop({ type: String })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  document: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ type: GeoPointSchema, required: true, index: '2dsphere' })
  location: GeoPointDocument;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  pickupRadiusKm: number;

  @Prop({ default: false })
  isApproved: boolean;

  @Prop({ required: true })
  createdAt: Date;
}

export const NgoSchema = SchemaFactory.createForClass(NgoDocument);
