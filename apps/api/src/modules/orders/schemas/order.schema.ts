import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ORDER_STATUSES } from '@colheita/contracts';
import type { OrderStatus } from '@colheita/contracts';
import type { DeliveryMode, OrderItem, OrderPayment, ServiceCharge } from '../entities/order.entity';

@Schema({ collection: 'orders' })
export class OrderDocument {
  @Prop({ type: String })
  _id: string;

  @Prop({ required: true, index: true })
  buyerId: string;

  @Prop({ required: true, index: true })
  producerId: string;

  @Prop({ type: [Object], required: true })
  items: OrderItem[];

  @Prop({ type: String, required: true })
  deliveryMode: DeliveryMode;

  @Prop({ type: [Object], default: [] })
  serviceCharges: ServiceCharge[];

  @Prop({ required: true })
  productsTotal: number;

  @Prop({ required: true })
  servicesTotal: number;

  @Prop({ required: true })
  platformFee: number;

  @Prop({ required: true })
  total: number;

  @Prop({ type: String, enum: ORDER_STATUSES, required: true, index: true })
  status: OrderStatus;

  @Prop({ type: Object, default: null })
  payment: OrderPayment | null;

  @Prop({ type: Date, default: null })
  paidAt: Date | null;

  @Prop({ type: Date, default: null })
  deliveredAt: Date | null;

  @Prop({ required: true })
  createdAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(OrderDocument);
