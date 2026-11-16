import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../entities/order.entity';
import { OrderDocument } from '../schemas/order.schema';
import { OrderRepository, SalesTotals } from './order.repository';

@Injectable()
export class MongoOrderRepository implements OrderRepository {
  constructor(@InjectModel(OrderDocument.name) private readonly orderModel: Model<OrderDocument>) {}

  async findById(orderId: string): Promise<Order | null> {
    const document = await this.orderModel.findById(orderId).lean();
    return document ? this.toEntity(document) : null;
  }

  async findByParticipant(userId: string): Promise<Order[]> {
    const documents = await this.orderModel
      .find({ $or: [{ buyerId: userId }, { producerId: userId }] })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return documents.map((document) => this.toEntity(document));
  }

  async save(order: Order): Promise<void> {
    const { id, ...fields } = order.toSnapshot();
    await this.orderModel.updateOne({ _id: id }, { $set: fields }, { upsert: true });
  }

  async calculateSalesTotals(): Promise<SalesTotals> {
    const [totals] = await this.orderModel.aggregate<SalesTotals>([
      { $match: { paidAt: { $ne: null }, status: { $ne: 'CANCELLED' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$_id',
          kilograms: { $sum: { $multiply: ['$items.boxes', '$items.boxWeightKg'] } },
          producerPayout: { $first: { $subtract: ['$productsTotal', '$platformFee'] } },
          hoursToPayment: { $first: { $divide: [{ $subtract: ['$paidAt', '$createdAt'] }, 3_600_000] } },
        },
      },
      {
        $group: {
          _id: null,
          kilogramsSold: { $sum: '$kilograms' },
          revenueToProducers: { $sum: '$producerPayout' },
          averageHoursToSale: { $avg: '$hoursToPayment' },
        },
      },
      { $project: { _id: 0, kilogramsSold: 1, revenueToProducers: 1, averageHoursToSale: 1 } },
    ]);
    return totals ?? { kilogramsSold: 0, revenueToProducers: 0, averageHoursToSale: null };
  }

  private toEntity(document: OrderDocument): Order {
    return Order.restore({
      id: document._id,
      buyerId: document.buyerId,
      producerId: document.producerId,
      items: document.items,
      deliveryMode: document.deliveryMode,
      serviceCharges: document.serviceCharges,
      productsTotal: document.productsTotal,
      servicesTotal: document.servicesTotal,
      platformFee: document.platformFee,
      total: document.total,
      status: document.status,
      payment: document.payment,
      paidAt: document.paidAt,
      deliveredAt: document.deliveredAt,
      createdAt: document.createdAt,
    });
  }
}
