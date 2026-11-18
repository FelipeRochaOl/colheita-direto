import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SERVICE_TYPES } from '@colheita/contracts';
import type { ServiceType } from '@colheita/contracts';
import { GeoPointDocument, GeoPointSchema } from '../../../shared/database/geo-point.schema';

@Schema({ _id: false })
export class ServiceOfferingDocument {
  @Prop({ type: String, enum: SERVICE_TYPES, required: true })
  serviceType: ServiceType;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 0 })
  baseFee: number;

  @Prop({ type: String, default: null })
  description: string | null;
}
const ServiceOfferingSchema = SchemaFactory.createForClass(ServiceOfferingDocument);

@Schema({ collection: 'service_providers' })
export class ServiceProviderDocument {
  @Prop({ type: String })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  document: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ type: [String], enum: SERVICE_TYPES, required: true })
  serviceTypes: ServiceType[];

  @Prop({ type: [ServiceOfferingSchema], default: [] })
  offerings: ServiceOfferingDocument[];

  @Prop({ type: GeoPointSchema, required: true, index: '2dsphere' })
  baseLocation: GeoPointDocument;

  @Prop({ required: true })
  serviceRadiusKm: number;

  @Prop({ type: Number, default: null })
  vehicleCapacityKg: number | null;

  @Prop({ default: false })
  hasRefrigeration: boolean;

  @Prop({ default: false, index: true })
  isApproved: boolean;

  @Prop({ type: String, default: null })
  paymentWalletId: string | null;

  @Prop({ required: true })
  createdAt: Date;
}

export const ServiceProviderSchema = SchemaFactory.createForClass(ServiceProviderDocument);
