import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/** Ponto GeoJSON para índices 2dsphere. */
@Schema({ _id: false })
export class GeoPointDocument {
  @Prop({ type: String, enum: ['Point'], default: 'Point' })
  type: 'Point';

  @Prop({ type: [Number], required: true })
  coordinates: number[];
}

export const GeoPointSchema = SchemaFactory.createForClass(GeoPointDocument);
