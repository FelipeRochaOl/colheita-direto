import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DONATION_STATUSES } from '@colheita/contracts';
import type { DonationStatus } from '@colheita/contracts';
import { GeoPointDocument, GeoPointSchema } from '../../../shared/database/geo-point.schema';

@Schema({ collection: 'donations' })
export class DonationDocument {
  @Prop({ type: String })
  _id: string;

  @Prop({ required: true, index: true })
  harvestLotId: string;

  @Prop({ required: true })
  producerId: string;

  @Prop({ required: true })
  producerName: string;

  @Prop({ required: true })
  crop: string;

  @Prop({ required: true })
  quantityBoxes: number;

  @Prop({ required: true })
  estimatedWeightKg: number;

  @Prop({ type: GeoPointSchema, required: true, index: '2dsphere' })
  pickupLocation: GeoPointDocument;

  @Prop({ type: String, enum: DONATION_STATUSES, required: true, index: true })
  status: DonationStatus;

  @Prop({ type: String, default: null, index: true })
  ngoId: string | null;

  @Prop({ type: Number, default: null })
  receivedWeightKg: number | null;

  @Prop({ type: Date, default: null })
  acceptedAt: Date | null;

  @Prop({ type: Date, default: null })
  receivedAt: Date | null;

  @Prop({ required: true })
  createdAt: Date;
}

export const DonationSchema = SchemaFactory.createForClass(DonationDocument);
