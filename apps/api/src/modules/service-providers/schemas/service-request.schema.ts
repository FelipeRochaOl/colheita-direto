import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SERVICE_REQUEST_STATUSES, SERVICE_TYPES } from '@colheita/contracts';
import type { ServiceRequestStatus, ServiceType } from '@colheita/contracts';
import { GeoPointDocument, GeoPointSchema } from '../../../shared/database/geo-point.schema';

@Schema({ collection: 'service_requests' })
export class ServiceRequestDocument {
  @Prop({ type: String })
  _id: string;

  @Prop({ required: true, index: true })
  producerId: string;

  @Prop({ required: true, index: true })
  serviceProviderId: string;

  @Prop({ type: String, enum: SERVICE_TYPES, required: true })
  serviceType: ServiceType;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  estimatedTotal: number;

  @Prop({ type: String, default: null })
  scheduledFor: string | null;

  @Prop({ type: String, default: null })
  notes: string | null;

  @Prop({ type: GeoPointSchema, required: true })
  pickupLocation: GeoPointDocument;

  @Prop({ type: String, enum: SERVICE_REQUEST_STATUSES, required: true })
  status: ServiceRequestStatus;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ type: Date, default: null })
  respondedAt: Date | null;
}

export const ServiceRequestSchema = SchemaFactory.createForClass(ServiceRequestDocument);
