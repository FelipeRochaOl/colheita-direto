import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { HarvestLotStatus } from '@colheita/contracts';
import { HarvestLot } from '../entities/harvest-lot.entity';
import { HarvestLotDocument } from '../schemas/harvest-lot.schema';
import { HarvestLotRepository, HarvestLotTotals } from './harvest-lot.repository';

@Injectable()
export class MongoHarvestLotRepository implements HarvestLotRepository {
  constructor(@InjectModel(HarvestLotDocument.name) private readonly harvestLotModel: Model<HarvestLotDocument>) {}

  async findById(harvestLotId: string): Promise<HarvestLot | null> {
    const document = await this.harvestLotModel.findById(harvestLotId).lean();
    return document ? this.toEntity(document) : null;
  }

  async findByProducer(producerId: string, statuses?: HarvestLotStatus[]): Promise<HarvestLot[]> {
    const filter = statuses?.length ? { producerId, status: { $in: statuses } } : { producerId };
    const documents = await this.harvestLotModel.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    return documents.map((document) => this.toEntity(document));
  }

  async save(harvestLot: HarvestLot): Promise<void> {
    const { id, ...fields } = harvestLot.toSnapshot();
    await this.harvestLotModel.updateOne({ _id: id }, { $set: fields }, { upsert: true });
  }

  async calculateTotals(): Promise<HarvestLotTotals> {
    const [totals] = await this.harvestLotModel.aggregate<HarvestLotTotals>([
      { $match: { classification: { $ne: null } } },
      {
        $group: {
          _id: null,
          lotsClassified: { $sum: 1 },
          kilogramsClassified: { $sum: { $multiply: ['$quantityBoxes', '$boxWeightKg'] } },
        },
      },
      { $project: { _id: 0, lotsClassified: 1, kilogramsClassified: 1 } },
    ]);
    return totals ?? { lotsClassified: 0, kilogramsClassified: 0 };
  }

  private toEntity(document: HarvestLotDocument): HarvestLot {
    return HarvestLot.restore({
      id: document._id,
      producerId: document.producerId,
      crop: document.crop,
      quantityBoxes: document.quantityBoxes,
      boxWeightKg: document.boxWeightKg,
      photoKeys: document.photoKeys,
      status: document.status,
      classification: document.classification,
      recommendedDestination: document.recommendedDestination,
      destination: document.destination,
      suggestedPricePerBox: document.suggestedPricePerBox,
      harvestedAt: document.harvestedAt,
      classifiedAt: document.classifiedAt,
      createdAt: document.createdAt,
    });
  }
}
