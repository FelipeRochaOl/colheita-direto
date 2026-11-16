import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { fromGeoJsonPoint, toGeoJsonPoint } from '../../../shared/geo/geo-distance';
import { Producer } from '../entities/producer.entity';
import { ProducerDocument } from '../schemas/producer.schema';
import { ProducerRepository } from './producer.repository';

@Injectable()
export class MongoProducerRepository implements ProducerRepository {
  constructor(@InjectModel(ProducerDocument.name) private readonly producerModel: Model<ProducerDocument>) {}

  async findById(producerId: string): Promise<Producer | null> {
    const document = await this.producerModel.findById(producerId).lean();
    return document ? this.toEntity(document) : null;
  }

  async findManyByIds(producerIds: string[]): Promise<Producer[]> {
    const documents = await this.producerModel.find({ _id: { $in: producerIds } }).lean();
    return documents.map((document) => this.toEntity(document));
  }

  async save(producer: Producer): Promise<void> {
    const { id, farmLocation, ...fields } = producer.toSnapshot();
    await this.producerModel.updateOne(
      { _id: id },
      { $set: { ...fields, farmLocation: toGeoJsonPoint(farmLocation) } },
      { upsert: true },
    );
  }

  countAll(): Promise<number> {
    return this.producerModel.countDocuments();
  }

  private toEntity(document: ProducerDocument): Producer {
    return Producer.restore({
      id: document._id,
      name: document.name,
      farmName: document.farmName,
      farmLocation: fromGeoJsonPoint(document.farmLocation),
      city: document.city,
      state: document.state,
      crops: document.crops,
      familyFarmRegistration: document.familyFarmRegistration,
      paymentWalletId: document.paymentWalletId,
      createdAt: document.createdAt,
    });
  }
}
