import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { QUALITY_GRADES } from '@colheita/contracts';
import type { QualityGrade } from '@colheita/contracts';
import { GeoPointDocument, GeoPointSchema } from '../../../shared/database/geo-point.schema';
import type { OfferChannel } from '../entities/offer.entity';

@Schema({ collection: 'offers' })
export class OfferDocument {
  @Prop({ type: String })
  _id: string;

  @Prop({ required: true, index: true })
  harvestLotId: string;

  @Prop({ required: true, index: true })
  producerId: string;

  @Prop({ required: true })
  producerName: string;

  @Prop({ required: true })
  crop: string;

  @Prop({ type: String, enum: QUALITY_GRADES, required: true })
  grade: QualityGrade;

  @Prop({ type: String, required: true })
  channel: OfferChannel;

  @Prop({ required: true, min: 0 })
  availableBoxes: number;

  @Prop({ required: true })
  boxWeightKg: number;

  @Prop({ required: true })
  pricePerBox: number;

  @Prop({ type: [String], default: [] })
  photoKeys: string[];

  @Prop({ type: GeoPointSchema, required: true, index: '2dsphere' })
  location: GeoPointDocument;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true })
  createdAt: Date;
}

export const OfferSchema = SchemaFactory.createForClass(OfferDocument);
OfferSchema.index({ isActive: 1, crop: 1, grade: 1 });
