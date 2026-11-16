import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HARVEST_LOT_STATUSES, LOT_DESTINATIONS } from '@colheita/contracts';
import type { HarvestLotStatus, LotClassification, LotDestination } from '@colheita/contracts';

@Schema({ collection: 'harvest_lots' })
export class HarvestLotDocument {
  @Prop({ type: String })
  _id: string;

  @Prop({ required: true, index: true })
  producerId: string;

  @Prop({ required: true })
  crop: string;

  @Prop({ required: true })
  quantityBoxes: number;

  @Prop({ required: true })
  boxWeightKg: number;

  @Prop({ type: [String], required: true })
  photoKeys: string[];

  @Prop({ type: String, enum: HARVEST_LOT_STATUSES, required: true })
  status: HarvestLotStatus;

  @Prop({ type: Object, default: null })
  classification: LotClassification | null;

  @Prop({ type: String, enum: LOT_DESTINATIONS, default: null })
  recommendedDestination: LotDestination | null;

  @Prop({ type: String, enum: LOT_DESTINATIONS, default: null })
  destination: LotDestination | null;

  @Prop({ type: Number, default: null })
  suggestedPricePerBox: number | null;

  @Prop({ required: true })
  harvestedAt: Date;

  @Prop({ type: Date, default: null })
  classifiedAt: Date | null;

  @Prop({ required: true })
  createdAt: Date;
}

export const HarvestLotSchema = SchemaFactory.createForClass(HarvestLotDocument);
HarvestLotSchema.index({ producerId: 1, createdAt: -1 });
HarvestLotSchema.index({ status: 1, createdAt: -1 });
