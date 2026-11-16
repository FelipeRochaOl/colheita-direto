import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { fromGeoJsonPoint, toGeoJsonPoint } from '../../../shared/geo/geo-distance';
import { Buyer } from '../entities/buyer.entity';
import { BuyerDocument } from '../schemas/buyer.schema';
import { BuyerRepository } from './buyer.repository';

@Injectable()
export class MongoBuyerRepository implements BuyerRepository {
  constructor(@InjectModel(BuyerDocument.name) private readonly buyerModel: Model<BuyerDocument>) {}

  async findById(buyerId: string): Promise<Buyer | null> {
    const document = await this.buyerModel.findById(buyerId).lean();
    if (!document) return null;
    return Buyer.restore({
      id: document._id,
      name: document.name,
      buyerType: document.buyerType,
      document: document.document,
      phoneNumber: document.phoneNumber,
      deliveryLocation: fromGeoJsonPoint(document.deliveryLocation),
      deliveryAddress: document.deliveryAddress,
      paymentCustomerId: document.paymentCustomerId,
      createdAt: document.createdAt,
    });
  }

  async save(buyer: Buyer): Promise<void> {
    const { id, deliveryLocation, ...fields } = buyer.toSnapshot();
    await this.buyerModel.updateOne(
      { _id: id },
      { $set: { ...fields, deliveryLocation: toGeoJsonPoint(deliveryLocation) } },
      { upsert: true },
    );
  }
}
