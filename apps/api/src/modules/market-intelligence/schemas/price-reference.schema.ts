import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'price_references' })
export class PriceReferenceDocument {
  @Prop({ required: true })
  crop: string;

  @Prop({ required: true })
  pricePerKg: number;

  @Prop({ required: true })
  source: string;

  @Prop({ required: true })
  referenceDate: Date;
}

export const PriceReferenceSchema = SchemaFactory.createForClass(PriceReferenceDocument);
PriceReferenceSchema.index({ crop: 1, referenceDate: -1 });
